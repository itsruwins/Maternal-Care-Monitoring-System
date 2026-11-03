-- 0025_sms_website_wording.sql  (Phase 9 review: "website", not "app")
-- Run once in the Supabase SQL editor, after 0024. Safe to run again.
--
-- Taysan MaternaCare is a website, with nothing to install. The "New time
-- proposed" text (REQUEST_NEW_TIME) said "Buksan ang app para tanggapin o
-- tanggihan."; it now says "Mag-log in sa website para tanggapin o
-- tanggihan."
--
-- 1. sync_appointment_reminder(): only that wording changed.
-- 2. Texts still waiting (not being sent right now) get the new wording too.
--    Sent, failed and skipped texts keep what they said.

-- 1. Queuing reminders, answers, bookings and visit changes ----------------------------------
-- Replaces 0024's version.

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

  if tg_op = 'INSERT' and public.current_user_role() in ('ADMIN', 'HEALTH_WORKER') then
    -- Staff booked a visit for her (a new booking or a rebook of a missed one).
    if new.status = 'CONFIRMED' and new.scheduled_datetime > now() then
      answer := 'VISIT_BOOKED';
    end if;
  elsif tg_op = 'UPDATE' and public.current_user_role() in ('ADMIN', 'HEALTH_WORKER') then
    if old.status = 'REQUESTED' then
      -- Staff answered her waiting request.
      answer := (
        case new.status
          when 'CONFIRMED' then 'REQUEST_CONFIRMED'
          when 'RESCHEDULED' then 'REQUEST_NEW_TIME'
          when 'CANCELLED' then 'REQUEST_DECLINED'
        end
      )::public.reminder_type;
    elsif old.status in ('CONFIRMED', 'RESCHEDULED') then
      -- Staff moved or cancelled a visit (or a new time she hasn't answered).
      if new.status = 'RESCHEDULED'
         and (old.status = 'CONFIRMED' or new.scheduled_datetime is distinct from old.scheduled_datetime) then
        answer := 'REQUEST_NEW_TIME';
      elsif new.status = 'CONFIRMED'
         and new.scheduled_datetime is distinct from old.scheduled_datetime then
        answer := 'VISIT_MOVED';
      elsif new.status = 'CANCELLED'
         and coalesce(old.scheduled_datetime, old.requested_datetime) > now()
         and exists (
           select 1 from public.pregnancy as p
           where p.pregnancy_id = new.pregnancy_id
             and p.pregnancy_status = 'ACTIVE'
         ) then
        answer := 'VISIT_CANCELLED';
      end if;
    end if;
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

  -- The answer or change goes on the next run (within 5 minutes).
  if answer is not null then
    local_time := coalesce(new.scheduled_datetime, new.requested_datetime) at time zone 'Asia/Manila';
    insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status)
    values (
      new.appointment_id,
      answer,
      phone,
      public.sms_plain(
        'Hi, ' || first_name || E'!\n\n'
          || case answer
               when 'REQUEST_CONFIRMED' then
                 'Kumpirmado na ang ' || activity_name || ' mo sa '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || ' sa health center. Salamat!'
               when 'REQUEST_NEW_TIME' then
                 'May bagong oras para sa ' || activity_name || ' mo: '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || '. Mag-log in sa website para tanggapin o tanggihan. Salamat!'
               when 'VISIT_BOOKED' then
                 'Naka-schedule na ang ' || activity_name || ' mo sa '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || ' sa health center. Salamat!'
               when 'VISIT_MOVED' then
                 'Inilipat ang ' || activity_name || ' mo sa '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || ' sa health center. Salamat!'
               when 'VISIT_CANCELLED' then
                 'Kinansela ang ' || activity_name || ' mo sa '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || '. Tumawag o pumunta sa health center para sa bagong schedule. Thank you!'
               else
                 'Hindi naaprubahan ang hiling mong ' || activity_name || ' sa '
                   || to_char(new.requested_datetime at time zone 'Asia/Manila', 'Dy, Mon FMDD, FMHH12:MI AM')
                   || '. Tumawag o pumunta sa health center. Thank you!'
             end
          || E'\n\nFrom: Brgy. Taysan Health Center'
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

  -- Her Confirmed, Booked or Moved text goes the same day: it already gives the date and time.
  if answer in ('REQUEST_CONFIRMED', 'VISIT_BOOKED', 'VISIT_MOVED') and (send_at at time zone 'Asia/Manila')::date <= manila_now::date then
    reminder_status := 'SKIPPED';
    reminder_reason := 'covered_by_answer';
  end if;

  insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status, status_reason)
  values (
    new.appointment_id,
    'UPCOMING',
    phone,
    public.sms_plain(
      'Hi, ' || first_name || E'!\n\n'
        || 'Paalala: ' || activity_name || ' mo sa '
        || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
        || ' sa health center. Dalhin ang booklet mo. Salamat!'
        || E'\n\nFrom: Brgy. Taysan Health Center'
    ),
    send_at,
    reminder_status,
    reminder_reason
  );
  return new;
end;
$$;

revoke execute on function public.sync_appointment_reminder() from public, anon, authenticated;

-- 2. Texts still waiting --------------------------------------------------------------------

update public.sms_reminder
set message_text = replace(message_text, 'Buksan ang app para tanggapin o tanggihan.', 'Mag-log in sa website para tanggapin o tanggihan.')
where delivery_status = 'PENDING'
  and message_text like '%Buksan ang app para tanggapin o tanggihan.%'
  and (claimed_at is null or claimed_at < now() - interval '10 minutes');
