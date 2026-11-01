-- 0018_sms_any_time.sql  (Phase 7: texts go out at any hour)
-- Run once in the Supabase SQL editor, after 0017. Safe to run again.
--
-- 1. claim_due_sms(): no sending hours. A due text goes on the next run, day
--    or night (retries, late bookings, request answers, Send now).
-- 2. sync_appointment_reminder(): a request answer now always goes out the
--    same day it is given, so a visit reminder due that day (or earlier) is
--    saved as Skipped (covered_by_answer). Only that rule changed.
-- 3. The send-sms job runs every 5 minutes, all day.
--
-- Visit reminders are still queued for 8:00 AM, N days before, and
-- missed-visit notices for 8:00 AM the next morning; only when a due text may
-- leave changes.

-- 1. Taking due texts: any time ------------------------------------------------------------
-- Replaces 0017's version.

create or replace function public.claim_due_sms()
returns setof public.sms_reminder
language plpgsql
security definer
set search_path = ''
as $$
declare
  due record;
  reason text;
begin
  -- Too late: marked Skipped with the reason, never sent.
  for due in
    select s.reminder_id
    from public.sms_reminder as s
    where s.delivery_status = 'PENDING'
      and coalesce(s.next_attempt_at, s.scheduled_at) <= now()
      and (s.claimed_at is null or s.claimed_at < now() - interval '10 minutes')
    for update skip locked
  loop
    reason := public.sms_skip_reason(due.reminder_id);
    if reason is not null then
      update public.sms_reminder
      set delivery_status = 'SKIPPED',
          status_reason = reason,
          next_attempt_at = null,
          claimed_at = null
      where reminder_id = due.reminder_id;
    end if;
  end loop;

  return query
  with claimed as (
    update public.sms_reminder as s
    set claimed_at = now(),
        attempt_count = s.attempt_count + 1
    where s.reminder_id in (
      select c.reminder_id
      from public.sms_reminder as c
      where c.delivery_status = 'PENDING'
        and coalesce(c.next_attempt_at, c.scheduled_at) <= now()
        and (c.claimed_at is null or c.claimed_at < now() - interval '10 minutes')
      order by coalesce(c.next_attempt_at, c.scheduled_at), c.reminder_id
      limit 20
      for update skip locked
    )
    returning s.*
  )
  select * from claimed;
end;
$$;

revoke execute on function public.claim_due_sms() from public, anon, authenticated;
grant execute on function public.claim_due_sms() to service_role;

-- 2. Queuing reminders and request answers --------------------------------------------------
-- Replaces 0017's version.

create or replace function public.sync_appointment_reminder()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  days_before integer;
  activity_name text;
  first_name text;
  phone text;
  send_at timestamptz;
  local_time timestamp;
  manila_now timestamp := now() at time zone 'Asia/Manila';
  answer public.reminder_type;
  reminder_status public.sms_delivery_status := 'PENDING';
  reminder_reason text;
begin
  if tg_op = 'UPDATE'
     and new.status = old.status
     and new.scheduled_datetime is not distinct from old.scheduled_datetime
     and new.activity_type_id = old.activity_type_id then
    return new;
  end if;

  -- Staff answered her waiting request (her own changes queue no answer).
  if tg_op = 'UPDATE'
     and old.status = 'REQUESTED'
     and public.current_user_role() in ('ADMIN', 'HEALTH_WORKER') then
    answer := (
      case new.status
        when 'CONFIRMED' then 'REQUEST_CONFIRMED'
        when 'RESCHEDULED' then 'REQUEST_NEW_TIME'
        when 'CANCELLED' then 'REQUEST_DECLINED'
      end
    )::public.reminder_type;
  end if;

  delete from public.sms_reminder
  where appointment_id = new.appointment_id
    and reminder_type <> 'MISSED_NOTICE'
    and delivery_status = 'PENDING'
    and attempt_count = 0;

  update public.sms_reminder
  set delivery_status = 'SKIPPED',
      status_reason = 'visit_changed',
      next_attempt_at = null
  where appointment_id = new.appointment_id
    and reminder_type <> 'MISSED_NOTICE'
    and delivery_status = 'PENDING'
    and (claimed_at is null or claimed_at < now() - interval '10 minutes');

  if answer is null
     and (new.status <> 'CONFIRMED' or new.scheduled_datetime is null or new.scheduled_datetime <= now()) then
    return new;
  end if;

  select t.reminder_days_before, t.name into days_before, activity_name
  from public.activity_type as t
  where t.activity_type_id = new.activity_type_id;

  select m.first_name, m.contact_number into first_name, phone
  from public.pregnancy as p
  join public.mother as m on m.mother_id = p.mother_id
  where p.pregnancy_id = new.pregnancy_id;

  -- The answer goes on the next run (within 5 minutes).
  if answer is not null then
    local_time := coalesce(new.scheduled_datetime, new.requested_datetime) at time zone 'Asia/Manila';
    insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status)
    values (
      new.appointment_id,
      answer,
      phone,
      public.sms_plain(
        case answer
          when 'REQUEST_CONFIRMED' then
            'Hi ' || first_name || '! Kumpirmado na ang ' || activity_name || ' mo sa '
              || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
              || ' sa health center. Salamat! -Brgy. Taysan Health Center'
          when 'REQUEST_NEW_TIME' then
            'Hi ' || first_name || '! May bagong oras para sa ' || activity_name || ' mo: '
              || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
              || '. Buksan ang app para tanggapin o tanggihan. Salamat! -Brgy. Taysan Health Center'
          else
            'Hi ' || first_name || '! Hindi naaprubahan ang hiling mong ' || activity_name || ' sa '
              || to_char(new.requested_datetime at time zone 'Asia/Manila', 'Dy, Mon FMDD, FMHH12:MI AM')
              || '. Tumawag o pumunta sa health center. -Brgy. Taysan Health Center'
        end
      ),
      now(),
      'PENDING'
    );
  end if;

  if new.status <> 'CONFIRMED' or new.scheduled_datetime is null or new.scheduled_datetime <= now() then
    return new;
  end if;

  local_time := new.scheduled_datetime at time zone 'Asia/Manila';
  send_at := ((local_time::date - coalesce(days_before, 1)) + time '08:00') at time zone 'Asia/Manila';
  -- Booked too late for the usual time: send as soon as possible instead.
  if send_at < now() then
    send_at := now();
  end if;

  -- Her Confirmed text goes the same day: it already gives the date and time.
  if answer = 'REQUEST_CONFIRMED' and (send_at at time zone 'Asia/Manila')::date <= manila_now::date then
    reminder_status := 'SKIPPED';
    reminder_reason := 'covered_by_answer';
  end if;

  insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status, status_reason)
  values (
    new.appointment_id,
    'UPCOMING',
    phone,
    public.sms_plain(
      'Hi ' || first_name || '! Paalala: ' || activity_name || ' mo sa '
        || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
        || ' sa health center. Dalhin ang booklet mo. Salamat! -Brgy. Taysan Health Center'
    ),
    send_at,
    reminder_status,
    reminder_reason
  );
  return new;
end;
$$;

revoke execute on function public.sync_appointment_reminder() from public, anon, authenticated;

-- 3. The schedule ---------------------------------------------------------------------------
-- Every 5 minutes, all day. Running this replaces the job of the same name.

select cron.schedule(
  'send-sms',
  '*/5 * * * *',
  $$select public.call_sms_sender();$$
);

-- Let the API see the changed functions right away.
notify pgrst, 'reload schema';
