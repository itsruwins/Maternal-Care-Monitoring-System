-- rosemarie-nov3-visit.sql  (TEST DATA, not a migration)
-- Adds a second prenatal checkup for Rosemarie on Tuesday, November 3, 9:00 AM,
-- so the "Your numbers" chart on her Visits page has two visits to draw.
--
-- The app only records visits for "now", so this inserts the row directly.
-- It copies the health worker, temperature, pulse, fundal height and fetal
-- heart rate from her November 4 visit, with slightly different numbers for
-- the chart: blood pressure 112/72, weight 59.6 kg. Weeks of pregnancy are
-- worked out by the database (trigger trg_prenatal_visit_check).
-- No appointment is linked, so no SMS goes out.
--
-- Run PART 1 in the Supabase SQL editor. PART 2 (commented out) removes it.

-- PART 1: add the visit ------------------------------------------------------------

do $$
declare
  visit_at constant timestamptz := '2026-11-03 09:00'::timestamp at time zone 'Asia/Manila';
  v_mother bigint;
  v_pregnancy bigint;
  latest public.prenatal_visit%rowtype;
  checkup bigint;
  new_visit bigint;
begin
  select m.mother_id, p.pregnancy_id into v_mother, v_pregnancy
  from public.mother as m
  join public.pregnancy as p on p.mother_id = m.mother_id and p.pregnancy_status = 'ACTIVE'
  where m.first_name ilike 'rosemarie%';
  if v_pregnancy is null then
    raise exception 'No mother named Rosemarie with a current pregnancy.';
  end if;
  if (select count(*) from public.mother where first_name ilike 'rosemarie%') > 1 then
    raise exception 'More than one Rosemarie: set v_mother by ID instead.';
  end if;

  if exists (
    select 1 from public.prenatal_visit
    where pregnancy_id = v_pregnancy
      and (visit_datetime at time zone 'Asia/Manila')::date = date '2026-11-03'
  ) then
    raise exception 'Rosemarie already has a visit on November 3.';
  end if;

  select * into latest
  from public.prenatal_visit
  where pregnancy_id = v_pregnancy
  order by visit_datetime desc
  limit 1;
  if latest.visit_id is null then
    raise exception 'Rosemarie has no visit to copy the health worker from.';
  end if;

  insert into public.prenatal_visit (
    pregnancy_id, health_worker_id, appointment_id, visit_datetime, aog_weeks,
    bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse_rate,
    fundal_height_cm, fetal_heart_rate, notes
  )
  values (
    v_pregnancy, latest.health_worker_id, null, visit_at, 0,
    112, 72, 59.6, latest.temperature_c, latest.pulse_rate,
    latest.fundal_height_cm, latest.fetal_heart_rate, null
  )
  returning visit_id into new_visit;

  select activity_type_id into checkup from public.activity_type where name = 'Prenatal Checkup';
  if checkup is not null then
    insert into public.visit_service (visit_id, activity_type_id, dose_or_details, result_notes)
    values (new_visit, checkup, '', null);
  end if;
end;
$$;

-- Her visits now
select
  v.visit_id,
  to_char(v.visit_datetime at time zone 'Asia/Manila', 'Dy, Mon FMDD FMHH12:MI AM') as visit,
  v.aog_weeks,
  v.bp_systolic || '/' || v.bp_diastolic as bp,
  v.weight_kg
from public.prenatal_visit as v
join public.pregnancy as p on p.pregnancy_id = v.pregnancy_id and p.pregnancy_status = 'ACTIVE'
join public.mother as m on m.mother_id = p.mother_id
where m.first_name ilike 'rosemarie%'
order by v.visit_datetime;

-- PART 2: remove it -----------------------------------------------------------------
-- Highlight everything between /* and */ and run just that.

/*

delete from public.visit_service as s
using public.prenatal_visit as v, public.pregnancy as p, public.mother as m
where s.visit_id = v.visit_id
  and p.pregnancy_id = v.pregnancy_id
  and m.mother_id = p.mother_id
  and m.first_name ilike 'rosemarie%'
  and v.visit_datetime = '2026-11-03 09:00'::timestamp at time zone 'Asia/Manila';

delete from public.prenatal_visit as v
using public.pregnancy as p, public.mother as m
where p.pregnancy_id = v.pregnancy_id
  and m.mother_id = p.mother_id
  and m.first_name ilike 'rosemarie%'
  and v.visit_datetime = '2026-11-03 09:00'::timestamp at time zone 'Asia/Manila';

*/
