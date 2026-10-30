-- 0014_phase5.sql  (Phase 5: prenatal visits & services)
-- Run once in the Supabase SQL editor, after 0001-0013.
--
-- 1. Typo limits on vital signs (values no person can have are refused). The
--    app uses the same limits, and also shows "please double-check" notes for
--    unusual but possible values. No diagnosis anywhere.
-- 2. Every visit:
--    * belongs to a current (ACTIVE) pregnancy when it is recorded;
--    * gets its weeks of pregnancy (AOG) worked out from the pregnancy (the
--      LMP, or the due date minus 280 days when the LMP is unknown);
--    * is recorded by the logged-in staff member;
--    * if linked to an appointment, that appointment must still be open
--      (Confirmed, New time sent or Missed) and becomes COMPLETED (the unsent
--      SMS reminder is then removed by the 0009 trigger).
--    Its pregnancy and appointment can't be changed afterwards.
-- 3. Editing: health workers can change a visit and its services only on the
--    day it was recorded (Manila time); admins can any time.
-- 4. record_visit() and update_visit() save a visit and its services together
--    (all or nothing). They run as the logged-in user, so the access rules
--    above still apply.
--
-- Errors for the app use errcode 22023 (or 42501 for "locked") with a short
-- code as the message: no_active_pregnancy, aog_out_of_range,
-- appointment_not_open, visit_locked, visit_fields_locked, no_staff_profile,
-- not_staff, service_invalid.
-- Nothing is deleted.

-- 1. Typo limits ------------------------------------------------------------------
-- NOT VALID: checked for new and changed visits only.

alter table public.prenatal_visit drop constraint if exists prenatal_visit_vitals_plausible;
alter table public.prenatal_visit
  add constraint prenatal_visit_vitals_plausible check (
        bp_systolic between 60 and 250
    and bp_diastolic between 30 and 150
    and bp_systolic > bp_diastolic
    and weight_kg between 30 and 200
    and temperature_c between 34 and 42
    and pulse_rate between 40 and 200
    and (fundal_height_cm is null or fundal_height_cm between 5 and 50)
    and (fetal_heart_rate is null or fetal_heart_rate between 80 and 220)
  ) not valid;

-- 2-3. Visit rules ------------------------------------------------------------------

-- Can the logged-in user still change this visit (and its services)?
create or replace function public.visit_editable(p_visit_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case public.current_user_role()
    when 'ADMIN' then true
    when 'HEALTH_WORKER' then exists (
      select 1 from public.prenatal_visit as v
      where v.visit_id = p_visit_id
        and (v.visit_datetime at time zone 'Asia/Manila')::date = (now() at time zone 'Asia/Manila')::date
    )
    else false
  end;
$$;

revoke execute on function public.visit_editable(bigint) from public, anon;
grant execute on function public.visit_editable(bigint) to authenticated;

create or replace function public.check_prenatal_visit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  preg record;
  appt_status public.appointment_status;
  lmp date;
  visit_day date := (new.visit_datetime at time zone 'Asia/Manila')::date;
  weeks integer;
begin
  if tg_op = 'INSERT' then
    select pregnancy_status, lmp_date, expected_delivery_date into preg
    from public.pregnancy where pregnancy_id = new.pregnancy_id;
    if preg.pregnancy_status is distinct from 'ACTIVE' then
      raise exception 'no_active_pregnancy' using errcode = '22023';
    end if;

    if new.appointment_id is not null then
      select status into appt_status from public.appointment
      where appointment_id = new.appointment_id and pregnancy_id = new.pregnancy_id;
      if appt_status is null or appt_status not in ('CONFIRMED', 'RESCHEDULED', 'MISSED') then
        raise exception 'appointment_not_open' using errcode = '22023';
      end if;
    end if;

    -- Recorded by whoever is logged in (staff).
    new.health_worker_id := coalesce(public.current_health_worker_id(), new.health_worker_id);
  else
    if new.pregnancy_id is distinct from old.pregnancy_id
       or new.appointment_id is distinct from old.appointment_id
       or new.health_worker_id is distinct from old.health_worker_id
       or new.visit_datetime is distinct from old.visit_datetime then
      raise exception 'visit_fields_locked' using errcode = '42501';
    end if;
    if public.current_user_role() = 'HEALTH_WORKER'
       and (old.visit_datetime at time zone 'Asia/Manila')::date <> (now() at time zone 'Asia/Manila')::date then
      raise exception 'visit_locked' using errcode = '42501';
    end if;
    select pregnancy_status, lmp_date, expected_delivery_date into preg
    from public.pregnancy where pregnancy_id = new.pregnancy_id;
  end if;

  -- Weeks of pregnancy on the visit day.
  lmp := coalesce(preg.lmp_date, preg.expected_delivery_date - 280);
  weeks := floor((visit_day - lmp) / 7.0);
  if lmp is null or weeks < 0 or weeks > 45 then
    raise exception 'aog_out_of_range' using errcode = '22023';
  end if;
  new.aog_weeks := weeks;

  return new;
end;
$$;

revoke execute on function public.check_prenatal_visit() from public, anon, authenticated;

drop trigger if exists trg_prenatal_visit_check on public.prenatal_visit;
create trigger trg_prenatal_visit_check
  before insert or update on public.prenatal_visit
  for each row execute function public.check_prenatal_visit();

-- The linked appointment is done.
create or replace function public.complete_visit_appointment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.appointment_id is not null then
    update public.appointment
    set status = 'COMPLETED'
    where appointment_id = new.appointment_id
      and status in ('CONFIRMED', 'RESCHEDULED', 'MISSED');
  end if;
  return new;
end;
$$;

revoke execute on function public.complete_visit_appointment() from public, anon, authenticated;

drop trigger if exists trg_prenatal_visit_complete_appointment on public.prenatal_visit;
create trigger trg_prenatal_visit_complete_appointment
  after insert on public.prenatal_visit
  for each row execute function public.complete_visit_appointment();

-- Services given: same edit window as their visit.
create or replace function public.check_visit_service()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() = 'HEALTH_WORKER' and not public.visit_editable(new.visit_id) then
    raise exception 'visit_locked' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and new.visit_id is distinct from old.visit_id then
    raise exception 'visit_fields_locked' using errcode = '42501';
  end if;
  new.dose_or_details := trim(coalesce(new.dose_or_details, ''));
  return new;
end;
$$;

revoke execute on function public.check_visit_service() from public, anon, authenticated;

drop trigger if exists trg_visit_service_check on public.visit_service;
create trigger trg_visit_service_check
  before insert or update on public.visit_service
  for each row execute function public.check_visit_service();

-- Health workers may remove a service from a visit on its own day.
drop policy if exists service_delete_staff_same_day on public.visit_service;
create policy service_delete_staff_same_day on public.visit_service
  for delete to authenticated
  using (public.current_user_role() = 'HEALTH_WORKER' and public.visit_editable(visit_id));

-- 4. Save a visit with its services -----------------------------------------------
-- p_services: [{"activity_type_id": 1, "dose_or_details": "TT2", "result_notes": null}, ...]

create or replace function public.record_visit(
  p_pregnancy_id bigint,
  p_appointment_id bigint,
  p_bp_systolic integer,
  p_bp_diastolic integer,
  p_weight_kg numeric,
  p_temperature_c numeric,
  p_pulse_rate integer,
  p_fundal_height_cm numeric,
  p_fetal_heart_rate integer,
  p_notes text,
  p_services jsonb
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_visit_id bigint;
  v_staff bigint := public.current_health_worker_id();
begin
  if public.current_user_role() not in ('ADMIN', 'HEALTH_WORKER') then
    raise exception 'not_staff' using errcode = '42501';
  end if;
  if v_staff is null then
    raise exception 'no_staff_profile' using errcode = '22023';
  end if;

  insert into public.prenatal_visit (
    pregnancy_id, health_worker_id, appointment_id, visit_datetime, aog_weeks,
    bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse_rate,
    fundal_height_cm, fetal_heart_rate, notes
  )
  values (
    p_pregnancy_id, v_staff, p_appointment_id, now(), 0,
    p_bp_systolic, p_bp_diastolic, p_weight_kg, p_temperature_c, p_pulse_rate,
    p_fundal_height_cm, p_fetal_heart_rate, nullif(trim(p_notes), '')
  )
  returning visit_id into v_visit_id;

  perform public.save_visit_services(v_visit_id, p_services);
  return v_visit_id;
end;
$$;

create or replace function public.update_visit(
  p_visit_id bigint,
  p_bp_systolic integer,
  p_bp_diastolic integer,
  p_weight_kg numeric,
  p_temperature_c numeric,
  p_pulse_rate integer,
  p_fundal_height_cm numeric,
  p_fetal_heart_rate integer,
  p_notes text,
  p_services jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not public.visit_editable(p_visit_id) then
    raise exception 'visit_locked' using errcode = '42501';
  end if;

  update public.prenatal_visit
  set bp_systolic = p_bp_systolic,
      bp_diastolic = p_bp_diastolic,
      weight_kg = p_weight_kg,
      temperature_c = p_temperature_c,
      pulse_rate = p_pulse_rate,
      fundal_height_cm = p_fundal_height_cm,
      fetal_heart_rate = p_fetal_heart_rate,
      notes = nullif(trim(p_notes), '')
  where visit_id = p_visit_id;

  delete from public.visit_service where visit_id = p_visit_id;
  perform public.save_visit_services(p_visit_id, p_services);
end;
$$;

-- Inserts the services list for a visit (used by the two functions above).
create or replace function public.save_visit_services(p_visit_id bigint, p_services jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  item jsonb;
begin
  if p_services is null or jsonb_typeof(p_services) <> 'array' then
    return;
  end if;
  for item in select * from jsonb_array_elements(p_services) loop
    if nullif(item ->> 'activity_type_id', '') is null then
      raise exception 'service_invalid' using errcode = '22023';
    end if;
    insert into public.visit_service (visit_id, activity_type_id, dose_or_details, result_notes)
    values (
      p_visit_id,
      (item ->> 'activity_type_id')::bigint,
      left(trim(coalesce(item ->> 'dose_or_details', '')), 120),
      nullif(left(trim(coalesce(item ->> 'result_notes', '')), 300), '')
    );
  end loop;
end;
$$;

revoke execute on function public.record_visit(bigint, bigint, integer, integer, numeric, numeric, integer, numeric, integer, text, jsonb) from public, anon;
revoke execute on function public.update_visit(bigint, integer, integer, numeric, numeric, integer, numeric, integer, text, jsonb) from public, anon;
revoke execute on function public.save_visit_services(bigint, jsonb) from public, anon;
grant execute on function public.record_visit(bigint, bigint, integer, integer, numeric, numeric, integer, numeric, integer, text, jsonb) to authenticated;
grant execute on function public.update_visit(bigint, integer, integer, numeric, numeric, integer, numeric, integer, text, jsonb) to authenticated;
grant execute on function public.save_visit_services(bigint, jsonb) to authenticated;
