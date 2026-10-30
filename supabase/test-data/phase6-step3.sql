-- phase6-step3.sql  (TEST DATA, not a migration)
-- Lets you check Phase 6 step 3 now, instead of waiting for real missed visits.
-- Only for testing: don't run it once real mothers use the system.
--
-- What it adds (all at times earlier today):
--   Mother A: two missed visits, not contacted yet (Follow-ups page, her
--             record's Follow-ups tab and count, "See follow-ups" in
--             Appointments), and an unanswered request whose time has passed
--             ("Date passed", no Confirm).
--   Mother B: an appointment marked Completed with no visit linked to it
--             ("Completed at her visit" on the Visits page).
--
-- Before you run it:
--   1. Pick two test mothers with a current pregnancy. Her ID is the number in
--      her record's address: /staff/mothers/<id>.
--   2. Mother A must have no visit and no booking made today: either one would
--      close the test missed visits as "Came in" or "Rebooked" straight away.
--   3. Mother B: record a walk-in visit for her in the app first
--      (Visits -> Walk-in visit). Or put 0 to skip her part.
--   4. Type both IDs at the top of PART 1 and run the whole file in the
--      Supabase SQL editor (PART 2 is commented out, so it won't run).
--
-- The database refuses appointments in the past (trigger
-- trg_appointment_check_slot from 0009). PART 1 switches that check off, adds
-- the rows and switches it back on, all in one transaction: if anything fails,
-- nothing is saved and the check stays on.
--
-- Test times are 10 or 40 minutes past the hour, so they never take a real
-- slot (run before 3:00 AM, they fall between midnight and now). Every test
-- appointment has the remark "TEST DATA (Phase 6 step 3)".

-- PART 1: add the test data ------------------------------------------------------

do $$
declare
  -- Type the test mothers' IDs here:
  mother_a bigint := 11;  -- missed visits + a request whose time has passed
  mother_b bigint := 0;  -- "Completed at her visit" (0 = skip)

  marker constant text := 'TEST DATA (Phase 6 step 3)';
  today date := (now() at time zone 'Asia/Manila')::date;
  today_start timestamptz := today::timestamp at time zone 'Asia/Manila';
  hour_start timestamptz := date_trunc('hour', now());
  -- Booked two days ago, so the test rows don't count as "Rebooked" for each other.
  booked_on timestamptz := hour_start - interval '2 days';
  spacing interval;
  missed_1 timestamptz;
  missed_2 timestamptz;
  done_at timestamptz;
  asked_for timestamptz;
  staff_user uuid;
  mother_a_user uuid;
  pregnancy_a bigint;
  pregnancy_b bigint;
  checkup bigint;
  tt bigint;
begin
  if mother_a = 0 then
    raise exception 'Type Mother A''s ID at the top of PART 1 first.';
  end if;

  -- Test times earlier today: 10 or 40 minutes past the hour (never a real
  -- slot). Before 3:00 AM there isn't room for that, so they're spread
  -- between midnight and now instead (no real slots at night).
  if hour_start - interval '3 hours' >= today_start then
    missed_1 := hour_start - interval '3 hours' + interval '10 minutes';
    missed_2 := hour_start - interval '2 hours' + interval '10 minutes';
    done_at := hour_start - interval '2 hours' + interval '40 minutes';
    asked_for := hour_start - interval '1 hour' + interval '10 minutes';
  else
    spacing := (now() - today_start) / 5;
    if spacing < interval '1 minute' then
      raise exception 'Run this again in a few minutes (just after midnight there''s no room for the test times).';
    end if;
    missed_1 := date_trunc('minute', today_start + spacing);
    missed_2 := date_trunc('minute', today_start + spacing * 2);
    done_at := date_trunc('minute', today_start + spacing * 3);
    asked_for := date_trunc('minute', today_start + spacing * 4);
  end if;
  if exists (select 1 from public.appointment where remarks like marker || '%') then
    raise exception 'The test data is already there. Run PART 2 (cleanup) first.';
  end if;

  select user_id into staff_user
  from public.user_account
  where role in ('ADMIN', 'HEALTH_WORKER')
  order by created_at
  limit 1;
  if staff_user is null then
    raise exception 'No staff account found.';
  end if;

  -- Mother A
  if not exists (select 1 from public.mother where mother_id = mother_a) then
    raise exception 'There is no mother with ID % (Mother A).', mother_a;
  end if;
  select p.pregnancy_id, m.user_id into pregnancy_a, mother_a_user
  from public.mother as m
  join public.pregnancy as p on p.mother_id = m.mother_id and p.pregnancy_status = 'ACTIVE'
  where m.mother_id = mother_a;
  if pregnancy_a is null then
    raise exception 'Mother A (ID %) has no current pregnancy. Pick a test mother who has one.', mother_a;
  end if;
  if exists (
    select 1 from public.prenatal_visit
    where pregnancy_id = pregnancy_a and visit_datetime > missed_1
  ) then
    raise exception 'Mother A (ID %) has a visit after %, which would close the test missed visits as "Came in". Pick another test mother.',
      mother_a, to_char(missed_1 at time zone 'Asia/Manila', 'FMHH12:MI AM');
  end if;
  if exists (
    select 1 from public.appointment
    where pregnancy_id = pregnancy_a and status <> 'CANCELLED' and created_at > missed_1
  ) then
    raise exception 'Mother A (ID %) has a booking made after %, which would close the test missed visits as "Rebooked". Cancel it in the app or pick another test mother.',
      mother_a, to_char(missed_1 at time zone 'Asia/Manila', 'FMHH12:MI AM');
  end if;

  -- Mother B
  if mother_b <> 0 then
    if mother_b = mother_a then
      raise exception 'Use two different mothers: Mother B''s visit today would close Mother A''s missed visits.';
    end if;
    if not exists (select 1 from public.mother where mother_id = mother_b) then
      raise exception 'There is no mother with ID % (Mother B).', mother_b;
    end if;
    select pregnancy_id into pregnancy_b
    from public.pregnancy
    where mother_id = mother_b and pregnancy_status = 'ACTIVE';
    if pregnancy_b is null then
      raise exception 'Mother B (ID %) has no current pregnancy. Pick a test mother who has one.', mother_b;
    end if;
    if not exists (
      select 1 from public.prenatal_visit
      where pregnancy_id = pregnancy_b
        and (visit_datetime at time zone 'Asia/Manila')::date = today
    ) then
      raise exception 'Record a walk-in visit for Mother B (ID %) in the app first (Visits -> Walk-in visit), then run this again.', mother_b;
    end if;
  end if;

  -- Services (any service if these were renamed)
  select activity_type_id into checkup from public.activity_type where name = 'Prenatal Checkup';
  select activity_type_id into tt from public.activity_type where name = 'Tetanus Toxoid Vaccination';
  checkup := coalesce(checkup, (select min(activity_type_id) from public.activity_type));
  tt := coalesce(tt, checkup);

  alter table public.appointment disable trigger trg_appointment_check_slot;

  insert into public.appointment
    (pregnancy_id, activity_type_id, requested_by_user_id, requested_datetime, scheduled_datetime, status, remarks, created_at)
  values
    (pregnancy_a, checkup, staff_user, missed_1, missed_1, 'MISSED', marker, booked_on),
    (pregnancy_a, tt, staff_user, missed_2, missed_2, 'MISSED', marker, booked_on),
    (pregnancy_a, checkup, coalesce(mother_a_user, staff_user), asked_for, null, 'REQUESTED', marker, booked_on);

  if mother_b <> 0 then
    insert into public.appointment
      (pregnancy_id, activity_type_id, requested_by_user_id, requested_datetime, scheduled_datetime, status, remarks, created_at)
    values
      (pregnancy_b, tt, staff_user, done_at, done_at, 'COMPLETED', marker, booked_on);
  end if;

  alter table public.appointment enable trigger trg_appointment_check_slot;
end;
$$;

-- What was added
select
  m.mother_id,
  m.first_name || ' ' || m.last_name as mother,
  t.name as service,
  a.status,
  to_char(coalesce(a.scheduled_datetime, a.requested_datetime) at time zone 'Asia/Manila', 'Dy, Mon FMDD FMHH12:MI AM') as time
from public.appointment as a
join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
join public.mother as m on m.mother_id = p.mother_id
join public.activity_type as t on t.activity_type_id = a.activity_type_id
where a.remarks like 'TEST DATA (Phase 6 step 3)%'
order by a.appointment_id;

-- PART 2: cleanup ------------------------------------------------------------------
-- When you're done testing: highlight everything between /* and */ below and
-- run just that. It removes the test appointments plus the follow-ups and
-- queued SMS logged against them. A test appointment you recorded a visit for
-- stays (visits are never deleted). What you made in the app while testing
-- (e.g. a rebooked appointment) isn't touched: cancel those in the app.

/*

do $$
declare
  marker constant text := 'TEST DATA (Phase 6 step 3)';
begin
  delete from public.follow_up as f
  using public.appointment as a
  where a.appointment_id = f.appointment_id
    and a.remarks like marker || '%'
    and not exists (select 1 from public.prenatal_visit as v where v.appointment_id = a.appointment_id);

  delete from public.sms_reminder as r
  using public.appointment as a
  where a.appointment_id = r.appointment_id
    and a.remarks like marker || '%'
    and not exists (select 1 from public.prenatal_visit as v where v.appointment_id = a.appointment_id);

  delete from public.appointment as a
  where a.remarks like marker || '%'
    and not exists (select 1 from public.prenatal_visit as v where v.appointment_id = a.appointment_id);
end;
$$;

select count(*) as test_appointments_left
from public.appointment
where remarks like 'TEST DATA (Phase 6 step 3)%';

*/
