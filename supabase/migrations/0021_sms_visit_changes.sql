-- 0021_sms_visit_changes.sql  (Phase 7: texts when staff move or cancel a visit)
-- Run once in the Supabase SQL editor, after 0020. Safe to run again.
--
-- Staff (admins and health workers) moving or cancelling a visit now text her,
-- like their answers to her requests:
--
-- 1. Two new text types: VISIT_MOVED (a confirmed visit moved, and confirmed
--    at once because she has no login) and VISIT_CANCELLED.
-- 2. sms_skip_reason(): the new types follow the request-answer rules (too
--    late after 1 day, visit passed, appointment no longer in that state).
-- 3. sync_appointment_reminder():
--    - Moved and she has a login (she must accept it in the app; also a new
--      time she hasn't answered yet, changed again): the "New time proposed"
--      text (REQUEST_NEW_TIME), same wording as for a request.
--    - Moved, no login: VISIT_MOVED. A reminder due the same day is Skipped
--      (covered_by_answer), as after a Confirmed text.
--    - Cancelled (confirmed, or a new time she hasn't answered): VISIT_CANCELLED,
--      except when her pregnancy is no longer active (closing a pregnancy
--      cancels her open visits) or the visit time has passed.
--    - Her own cancel, accept or decline still sends nothing.
--
-- The new text types only exist once this file has run: everything that uses
-- them is plpgsql and none of it runs here.

-- 1. New text types -------------------------------------------------------------------------

alter type public.reminder_type add value if not exists 'VISIT_MOVED';
alter type public.reminder_type add value if not exists 'VISIT_CANCELLED';

-- 2. The too-late check ---------------------------------------------------------------------
-- Replaces 0017's version: adds the two new types to the answer rules.

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
    -- A request answer or visit change: queued when staff acted, so
    -- scheduled_at is that time.
    if r.scheduled_at < now() - interval '1 day' then
      return 'answer_late';
    end if;
    if coalesce(appt.scheduled_datetime, appt.requested_datetime) <= now() then
      return 'visit_passed';
    end if;
    if appt.status is distinct from (
      case r.reminder_type
        when 'REQUEST_CONFIRMED' then 'CONFIRMED'
        when 'VISIT_MOVED' then 'CONFIRMED'
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

-- 3. Queuing reminders, request answers and visit changes -------------------------------------
-- Replaces 0020's version.

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

  if tg_op = 'UPDATE' and public.current_user_role() in ('ADMIN', 'HEALTH_WORKER') then
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
        'Hi ' || first_name || E'!\n\n'
          || case answer
               when 'REQUEST_CONFIRMED' then
                 'Kumpirmado na ang ' || activity_name || ' mo sa '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || ' sa health center. Salamat!'
               when 'REQUEST_NEW_TIME' then
                 'May bagong oras para sa ' || activity_name || ' mo: '
                   || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
                   || '. Buksan ang app para tanggapin o tanggihan. Salamat!'
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

  -- Her Confirmed or Moved text goes the same day: it already gives the date and time.
  if answer in ('REQUEST_CONFIRMED', 'VISIT_MOVED') and (send_at at time zone 'Asia/Manila')::date <= manila_now::date then
    reminder_status := 'SKIPPED';
    reminder_reason := 'covered_by_answer';
  end if;

  insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status, status_reason)
  values (
    new.appointment_id,
    'UPCOMING',
    phone,
    public.sms_plain(
      'Hi ' || first_name || E'!\n\n'
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
