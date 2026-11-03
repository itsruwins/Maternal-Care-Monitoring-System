-- 0024_sms_visit_booked.sql  (Phase 9: a text when staff book a visit; "Hi, {name}!")
-- Run once in the Supabase SQL editor, after 0023. Safe to run again.
--
-- 1. New text type VISIT_BOOKED: when an admin or health worker books a visit
--    (Appointments -> Book, or Follow-ups -> Rebook after a missed visit), she
--    gets "Naka-schedule na ang {service} mo sa {date, time} sa health
--    center." right away, like the Visit moved text. Her usual reminder still
--    goes before the visit, except when it falls on the same day as this text
--    (Skipped, covered_by_answer). Her own requests are unchanged (they start
--    as Requested and get the Confirmed text when staff confirm them).
-- 2. sms_skip_reason(): VISIT_BOOKED follows the answer rules (too late after
--    1 day, visit passed, visit no longer Confirmed).
-- 3. sync_appointment_reminder(): queues VISIT_BOOKED; every text now starts
--    "Hi, {name}!" (with a comma).
-- 4. mark_missed_appointments(): the missed-visit notice starts "Hi, {name}!".
--    Only the wording changed.
-- 5. Texts still waiting (not being sent right now) get the comma too. Sent,
--    failed and skipped texts keep what they said.
--
-- The new text type only exists once this file has run: everything that uses
-- it is plpgsql and none of it runs here.

-- 1. New text type --------------------------------------------------------------------------

alter type public.reminder_type add value if not exists 'VISIT_BOOKED';

-- 2. The too-late check ---------------------------------------------------------------------
-- Replaces 0021's version: adds VISIT_BOOKED to the answer rules.

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
        when 'VISIT_BOOKED' then 'CONFIRMED'
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

-- 3. Queuing reminders, answers, bookings and visit changes ----------------------------------
-- Replaces 0021's version.

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
                   || '. Buksan ang app para tanggapin o tanggihan. Salamat!'
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

-- 4. The daily missed check -----------------------------------------------------------------
-- Replaces 0020's version.

create or replace function public.mark_missed_appointments()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  notice_at timestamptz := ((today + 1) + time '08:00') at time zone 'Asia/Manila';
  appt record;
  new_status public.appointment_status;
  changed integer := 0;
begin
  -- Run by hand before 8:00 AM: the message goes at 8:00 AM that morning.
  if ((today + time '08:00') at time zone 'Asia/Manila') > now() then
    notice_at := (today + time '08:00') at time zone 'Asia/Manila';
  end if;

  for appt in
    select a.appointment_id, a.pregnancy_id, a.status, a.scheduled_datetime,
           (a.scheduled_datetime at time zone 'Asia/Manila')::date as missed_day,
           t.name as service, m.first_name, m.contact_number
    from public.appointment as a
    join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
    join public.mother as m on m.mother_id = p.mother_id
    join public.activity_type as t on t.activity_type_id = a.activity_type_id
    where a.status in ('CONFIRMED', 'RESCHEDULED')
      and a.scheduled_datetime < now()
      and p.pregnancy_status = 'ACTIVE'
    order by a.scheduled_datetime
  loop
    -- Any visit for her that day means she came (a visit links only one
    -- appointment, e.g. a checkup and a TT shot booked back to back).
    if exists (
      select 1 from public.prenatal_visit as v
      where v.pregnancy_id = appt.pregnancy_id
        and (v.visit_datetime at time zone 'Asia/Manila')::date = appt.missed_day
    ) then
      new_status := 'COMPLETED';
    else
      new_status := 'MISSED';
    end if;

    -- Skip it if something changed it meanwhile (e.g. a visit saved just now).
    update public.appointment
    set status = new_status
    where appointment_id = appt.appointment_id
      and status in ('CONFIRMED', 'RESCHEDULED');
    if not found then
      continue;
    end if;
    changed := changed + 1;

    -- Missed-visit SMS: only for a time she agreed to (Confirmed), found within
    -- 2 days, while the follow-up is still open (she may have rebooked already).
    if new_status = 'MISSED'
       and appt.status = 'CONFIRMED'
       and appt.missed_day >= today - 2
       and exists (
         select 1 from public.follow_up_item as i
         where i.appointment_id = appt.appointment_id
           and i.is_open
       ) then
      insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status)
      values (
        appt.appointment_id,
        'MISSED_NOTICE',
        appt.contact_number,
        public.sms_plain(
          'Hi, ' || appt.first_name || E'!\n\n'
            || 'Hindi ka nakarating sa ' || appt.service || ' mo noong '
            || to_char(appt.scheduled_datetime at time zone 'Asia/Manila', 'Dy, Mon FMDD')
            || '. Pumunta o tumawag sa health center para sa bagong schedule. Salamat!'
            || E'\n\nFrom: Brgy. Taysan Health Center'
        ),
        notice_at,
        'PENDING'
      );
    end if;
  end loop;

  return changed;
end;
$$;

-- Only the scheduler and the SQL editor run it.
revoke execute on function public.mark_missed_appointments() from public, anon, authenticated;

-- 5. Texts still waiting --------------------------------------------------------------------
-- "Hi Ana!" becomes "Hi, Ana!". A text that already has the comma doesn't match
-- 'Hi %', so running this again changes nothing. One being sent right now is
-- left alone.

update public.sms_reminder
set message_text = 'Hi, ' || substr(message_text, 4)
where delivery_status = 'PENDING'
  and message_text like 'Hi %'
  and (claimed_at is null or claimed_at < now() - interval '10 minutes');
