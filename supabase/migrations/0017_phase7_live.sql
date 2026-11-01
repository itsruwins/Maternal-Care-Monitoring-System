-- 0017_phase7_live.sql  (Phase 7 step 3: no test mode, texts for request answers)
-- Run once in the Supabase SQL editor, after 0016. Safe to run again.
--
-- 1. Three new text types, queued when staff answer a mother's request:
--    REQUEST_CONFIRMED, REQUEST_NEW_TIME (she accepts or declines in the app)
--    and REQUEST_DECLINED.
-- 2. No test mode: texts always go to her number, inside sending hours
--    (8:00 AM to 8:00 PM Manila). claim_due_sms() no longer reads a mode.
-- 3. sms_setting keeps only the phone and plan status: mode, test_number,
--    updated_by and updated_at are dropped, with their trigger, the admin
--    update rule and the sms_mode type.
-- 4. sms_skip_reason(): a request answer is too late when it is more than 1
--    day late (answer_late), when the time it gives has passed
--    (visit_passed), or when the appointment is no longer in the state it
--    announces (visit_changed).
-- 5. sync_appointment_reminder():
--    - Only staff answering a waiting request queue an answer; her own
--      cancel, accept or decline, and visits staff book directly, queue none.
--      No staff remarks go in the text.
--    - Any later change to the appointment removes its unsent answer, like an
--      unsent reminder (kept as Skipped once it was tried).
--    - A visit reminder that would go out the same day as her "Confirmed"
--      text is saved as Skipped (covered_by_answer): the Confirmed text
--      already gives the date and time.
--
-- The new text types only exist once this file has run: everything that uses
-- them is plpgsql and none of it runs here.

-- 1. New text types ---------------------------------------------------------------------

alter type public.reminder_type add value if not exists 'REQUEST_CONFIRMED';
alter type public.reminder_type add value if not exists 'REQUEST_NEW_TIME';
alter type public.reminder_type add value if not exists 'REQUEST_DECLINED';

-- 2. Taking due texts: sending hours for every text --------------------------------------
-- Replaces 0016's version (which let Test mode send any time).

create or replace function public.claim_due_sms()
returns setof public.sms_reminder
language plpgsql
security definer
set search_path = ''
as $$
declare
  local_time time := (now() at time zone 'Asia/Manila')::time;
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

  -- Texts go 8:00 AM to 8:00 PM Manila.
  if local_time < time '08:00' or local_time >= time '20:00' then
    return;
  end if;

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

-- 3. SMS settings without test mode -------------------------------------------------------

drop trigger if exists trg_sms_setting_stamp on public.sms_setting;
drop function if exists public.stamp_sms_setting();
drop policy if exists sms_setting_update_admin on public.sms_setting;
revoke update on public.sms_setting from authenticated;

alter table public.sms_setting
  drop column if exists mode,
  drop column if exists test_number,
  drop column if exists updated_by,
  drop column if exists updated_at;

drop type if exists public.sms_mode;

-- 4. The too-late check -------------------------------------------------------------------
-- Replaces 0016's version: adds the request answers. Returns null when the
-- text may still go out, else the reason.

create or replace function public.sms_skip_reason(p_reminder_id bigint)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  r record;
  appt record;
begin
  select s.reminder_id, s.appointment_id, s.reminder_type, s.scheduled_at into r
  from public.sms_reminder as s
  where s.reminder_id = p_reminder_id;
  if not found then
    return 'not_found';
  end if;

  select a.status, a.scheduled_datetime, a.requested_datetime into appt
  from public.appointment as a
  where a.appointment_id = r.appointment_id;

  if r.reminder_type = 'UPCOMING' then
    if appt.scheduled_datetime is not null and appt.scheduled_datetime <= now() then
      return 'visit_passed';
    end if;
    if appt.status is distinct from 'CONFIRMED' then
      return 'visit_changed';
    end if;
    -- Moving a visit queues a new reminder; an older one no longer applies.
    if exists (
      select 1 from public.sms_reminder as n
      where n.appointment_id = r.appointment_id
        and n.reminder_type = 'UPCOMING'
        and n.reminder_id > r.reminder_id
    ) then
      return 'visit_changed';
    end if;
  elsif r.reminder_type = 'MISSED_NOTICE' then
    if not exists (
      select 1 from public.follow_up_item as i
      where i.appointment_id = r.appointment_id
        and i.is_open
    ) then
      return 'follow_up_closed';
    end if;
    if r.scheduled_at < now() - interval '1 day' then
      return 'notice_late';
    end if;
  else
    -- A request answer: queued when staff answered, so scheduled_at is that time.
    if r.scheduled_at < now() - interval '1 day' then
      return 'answer_late';
    end if;
    if coalesce(appt.scheduled_datetime, appt.requested_datetime) <= now() then
      return 'visit_passed';
    end if;
    if appt.status is distinct from (
      case r.reminder_type
        when 'REQUEST_CONFIRMED' then 'CONFIRMED'
        when 'REQUEST_NEW_TIME' then 'RESCHEDULED'
        else 'CANCELLED'
      end
    )::public.appointment_status then
      return 'visit_changed';
    end if;
  end if;

  return null;
end;
$$;

revoke execute on function public.sms_skip_reason(bigint) from public, anon, authenticated;

-- 5. Queuing reminders and request answers -----------------------------------------------
-- Replaces 0016's version. Unsent texts of a changed appointment (reminders
-- and request answers): never tried ones are removed, ones already tried are
-- kept as Skipped, and one being sent right now is left for the sender (the
-- next run skips it if it has to try again).

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
  answer_day date;
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

  -- The answer goes on the next run inside sending hours: today, or tomorrow
  -- morning when it is already 8:00 PM or later.
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
    answer_day := case when manila_now::time >= time '20:00' then manila_now::date + 1 else manila_now::date end;
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
  if answer = 'REQUEST_CONFIRMED' and (send_at at time zone 'Asia/Manila')::date <= answer_day then
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

-- Let the API see the changed table and functions right away.
notify pgrst, 'reload schema';
