-- 0020_sms_layout.sql  (Phase 7: texts in three parts)
-- Run once in the Supabase SQL editor, after 0019. Safe to run again.
--
-- Every text now reads:
--
--   Hi {name}!
--
--   {the message}
--
--   From: Brgy. Taysan Health Center
--
-- 1. sms_plain(): keeps line breaks (at most one blank line in a row); other
--    spaces are still squeezed to one.
-- 2. sync_appointment_reminder(): the visit reminder and the three request
--    answers in the new layout; the Declined text now ends "Thank you!".
--    Only the wording changed.
-- 3. mark_missed_appointments(): the missed-visit notice in the new layout.
--    Only the wording changed.
-- 4. Texts still waiting (not being sent right now) get the new layout too.
--    Sent, failed and skipped texts keep what they said.

-- 1. Plain characters, line breaks kept ----------------------------------------------------
-- Replaces 0016's version.

create or replace function public.sms_plain(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          replace(replace(replace(replace(replace(
            translate(
              translate(
                p_text,
                'ÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÇáàâäãéèêëíìîïóòôöõúùûüç',
                'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'
              ),
              -- ‘ ’ ‚ “ ” „ – — no-break space, narrow no-break space
              chr(8216) || chr(8217) || chr(8218) || chr(8220) || chr(8221) || chr(8222)
                || chr(8211) || chr(8212) || chr(160) || chr(8239),
              repeat(chr(39), 3) || '"""--  '
            ),
            chr(8230), '...'),   -- …
            chr(8288), ''),      -- word joiner
            chr(8203), ''),      -- zero-width space
            chr(173), ''),       -- soft hyphen
            chr(13), ''),        -- carriage return (line breaks are plain \n)
          '[[:blank:]]+', ' ', 'g'),              -- spaces and tabs: one space
        ' ?\n ?', E'\n', 'g'),                    -- no space next to a line break
      '\n{3,}', E'\n\n', 'g'),                    -- at most one blank line
    E' \n'
  );
$$;

revoke execute on function public.sms_plain(text) from public, anon, authenticated;

-- 2. Queuing reminders and request answers --------------------------------------------------
-- Replaces 0018's version.

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

-- 3. The daily missed check --------------------------------------------------------------
-- Replaces 0016's version.

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
          'Hi ' || appt.first_name || E'!\n\n'
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

-- 4. Texts still waiting ------------------------------------------------------------------
-- Old ending " -Brgy. Taysan Health Center" marks the old layout, so each text
-- is changed only once. One being sent right now is left alone.

update public.sms_reminder
set message_text = public.sms_plain(
      regexp_replace(
        replace(
          replace(
            message_text,
            'Tumawag o pumunta sa health center. -Brgy. Taysan Health Center',
            'Tumawag o pumunta sa health center. Thank you! -Brgy. Taysan Health Center'
          ),
          ' -Brgy. Taysan Health Center',
          E'\n\nFrom: Brgy. Taysan Health Center'
        ),
        '^(Hi [^!]*!) ', E'\\1\n\n'
      )
    )
where delivery_status = 'PENDING'
  and message_text like '% -Brgy. Taysan Health Center'
  and (claimed_at is null or claimed_at < now() - interval '10 minutes');
