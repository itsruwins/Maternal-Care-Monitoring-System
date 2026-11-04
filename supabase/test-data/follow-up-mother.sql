-- follow-up-mother.sql  (TEST DATA, not a migration)
-- Adds one test mother who needs a follow-up, so the follow-up screens can be
-- checked without waiting for a real missed visit. Only for testing: don't run
-- it once real mothers use the system.
--
-- What it adds:
--   Teresa Dalisay Mercado (no login), Purok = the first purok on the list,
--   about 26 weeks pregnant:
--   * a checkup visit 4 weeks before the missed one (where it was booked);
--   * a Prenatal Checkup she MISSED: the latest weekday at least 2 days ago,
--     9:10 AM;
--   * one follow-up try the day after: a call, not reached.
--   Nothing sorts it out (no later visit or booking), so it stays open.
--
-- Where she shows up:
--   * Follow-ups page: one open follow-up, 1 try, last result "Not reached".
--   * Appointments: "Missed, to follow up" count, the List's Missed tab.
--   * Her record: the follow-up notice, Recent activity, Last visit.
--   * Home dashboard: the follow-ups card.
--
-- Before you run it:
--   1. You need at least one staff account (health worker profile) and one
--      purok. first-admin.sql gives you the staff account.
--   2. Optional: put your own test phone in her_number below. Rebooking her
--      from the Follow-ups page texts this number ("Naka-schedule na ...").
--      With the dummy number that text just fails (it still uses one of the
--      month's free texts).
--   3. Run the whole file in the Supabase SQL editor (PART 2 is commented
--      out, so it won't run).
--
-- The database refuses appointments in the past (trigger
-- trg_appointment_check_slot from 0009). PART 1 switches that check off, adds
-- the rows and switches it back on, all in one transaction: if anything fails,
-- nothing is saved and the check stays on. The missed time is 10 minutes past
-- the hour, so it never takes a real slot. Adding a Missed appointment here
-- queues no text (only staff bookings of future visits do).

-- PART 1: add the test data ------------------------------------------------------

do $$
declare
  her_number constant text := '09000000000';  -- or your own test phone (09XXXXXXXXX)

  marker constant text := 'TEST DATA (follow-up mother)';
  today date := (now() at time zone 'Asia/Manila')::date;
  missed_day date := today - 2;
  missed_at timestamptz;
  last_visit_at timestamptz;
  tried_on date;
  staff bigint;
  purok bigint;
  checkup bigint;
  new_mother bigint;
  new_pregnancy bigint;
  new_visit bigint;
  new_appointment bigint;
begin
  if exists (select 1 from public.pregnancy where remarks = marker) then
    raise exception 'The test mother is already there. Run PART 2 (cleanup) first.';
  end if;
  if her_number !~ '^09[0-9]{9}$' then
    raise exception 'her_number must look like 09XXXXXXXXX (11 digits).';
  end if;

  -- The latest weekday at least 2 days ago (the health center is closed on weekends).
  while extract(isodow from missed_day) in (6, 7) loop
    missed_day := missed_day - 1;
  end loop;
  missed_at := (missed_day + time '09:10') at time zone 'Asia/Manila';
  last_visit_at := ((missed_day - 28) + time '09:40') at time zone 'Asia/Manila';
  tried_on := least(missed_day + 1, today);

  select health_worker_id into staff
  from public.health_worker
  order by health_worker_id
  limit 1;
  if staff is null then
    raise exception 'No staff profile found. Run supabase/seed/first-admin.sql first.';
  end if;

  select purok_id into purok
  from public.purok
  where is_active
  order by sort_order, purok_id
  limit 1;
  if purok is null then
    raise exception 'No purok found. Add one in Settings first.';
  end if;

  select activity_type_id into checkup from public.activity_type where name = 'Prenatal Checkup';
  checkup := coalesce(checkup, (select min(activity_type_id) from public.activity_type));

  -- Her
  insert into public.mother
    (user_id, registered_by, first_name, middle_name, last_name, date_of_birth, purok_id,
     street_address, contact_number, emergency_contact_name, emergency_contact_no, registration_date)
  values
    (null, staff, 'Teresa', 'Dalisay', 'Mercado', date '1998-05-14', purok,
     '12 Mabini St.', her_number, 'Ramon Mercado', '09000000001', today - 70)
  returning mother_id into new_mother;

  -- About 26 weeks pregnant today.
  insert into public.pregnancy
    (mother_id, gravida, para, lmp_date, expected_delivery_date, pregnancy_status, registration_date, remarks)
  values
    (new_mother, 2, 1, today - 182, today - 182 + 280, 'ACTIVE', today - 70, marker)
  returning pregnancy_id into new_pregnancy;

  -- Her last visit (the trigger works out the weeks).
  insert into public.prenatal_visit
    (pregnancy_id, health_worker_id, appointment_id, visit_datetime, bp_systolic, bp_diastolic,
     weight_kg, temperature_c, pulse_rate, fundal_height_cm, fetal_heart_rate, notes)
  values
    (new_pregnancy, staff, null, last_visit_at, 118, 76, 58.2, 36.6, 82, 21, 142, marker)
  returning visit_id into new_visit;

  insert into public.visit_service (visit_id, activity_type_id, dose_or_details, result_notes)
  values (new_visit, checkup, '', null);

  -- The checkup she missed, booked at that visit.
  alter table public.appointment disable trigger trg_appointment_check_slot;

  insert into public.appointment
    (pregnancy_id, activity_type_id, requested_by_user_id, reviewed_by, requested_datetime,
     scheduled_datetime, status, remarks, created_at)
  values
    (new_pregnancy, checkup,
     (select user_id from public.health_worker where health_worker_id = staff),
     staff, missed_at, missed_at, 'MISSED', marker, last_visit_at)
  returning appointment_id into new_appointment;

  alter table public.appointment enable trigger trg_appointment_check_slot;

  -- One try so far: a call the day after, not reached.
  insert into public.follow_up
    (appointment_id, health_worker_id, follow_up_date, method, outcome_notes, result)
  values
    (new_appointment, staff, tried_on, 'CALL', 'Called, no answer. Will try again.', 'NOT_REACHED');
end;
$$;

-- What was added (is_open should be true)
select
  i.mother_id,
  concat_ws(' ', i.first_name, i.middle_name, i.last_name) as mother,
  i.contact_number,
  i.service,
  to_char(i.missed_at at time zone 'Asia/Manila', 'Dy, Mon FMDD FMHH12:MI AM') as missed,
  i.attempts,
  i.last_result,
  i.is_open
from public.follow_up_item as i
join public.pregnancy as p on p.pregnancy_id = i.pregnancy_id
where p.remarks = 'TEST DATA (follow-up mother)';

-- PART 2: cleanup ------------------------------------------------------------------
-- When you're done testing: highlight everything between /* and */ below and
-- run just that. It removes the test mother and everything recorded for her,
-- including what you added in the app while testing (follow-up tries, a
-- rebooked appointment, its texts, a visit).

/*

do $$
declare
  marker constant text := 'TEST DATA (follow-up mother)';
  her_mother bigint;
  her_pregnancy bigint;
begin
  select mother_id, pregnancy_id into her_mother, her_pregnancy
  from public.pregnancy
  where remarks = marker;
  if her_pregnancy is null then
    raise notice 'Nothing to remove.';
    return;
  end if;
  if exists (select 1 from public.mother where mother_id = her_mother and user_id is not null) then
    raise exception 'The test mother (ID %) has a login now. Remove her login in Accounts first.', her_mother;
  end if;

  delete from public.follow_up as f
  using public.appointment as a
  where a.appointment_id = f.appointment_id and a.pregnancy_id = her_pregnancy;

  delete from public.sms_reminder as r
  using public.appointment as a
  where a.appointment_id = r.appointment_id and a.pregnancy_id = her_pregnancy;

  delete from public.visit_service as s
  using public.prenatal_visit as v
  where v.visit_id = s.visit_id and v.pregnancy_id = her_pregnancy;

  delete from public.prenatal_visit where pregnancy_id = her_pregnancy;
  delete from public.appointment where pregnancy_id = her_pregnancy;
  delete from public.pregnancy where mother_id = her_mother;
  delete from public.mother where mother_id = her_mother;
end;
$$;

select count(*) as test_mothers_left
from public.pregnancy
where remarks = 'TEST DATA (follow-up mother)';

*/
