-- 0009_phase4.sql  (Phase 4: appointments)
-- Run once in the Supabase SQL editor, after 0001-0008.
--
-- 1. Closed days: admins mark dates the health center is closed.
-- 2. Slot rules, checked whenever an appointment time is set or changed:
--    30-minute slots, Monday to Friday, 8:00-11:30 and 1:00-2:30 (Manila
--    time), not on a closed day, not in the past. Mothers can only request
--    from tomorrow up to 3 months ahead, for their current pregnancy.
-- 3. One appointment per slot, whatever the service. A waiting request holds
--    its requested time; everything else holds its scheduled time. Cancelled
--    appointments hold nothing.
-- 4. Mother actions (safe functions; mothers can't update appointments
--    directly): cancel (requests any time, confirmed visits until the day
--    before) and accept or decline a new time proposed by staff.
-- 5. taken_slots(): which slots are taken in a date range, without saying whose.
-- 6. The SMS queue follows the appointment: a confirmed future visit has one
--    PENDING "UPCOMING" reminder (8:00 AM, N days before; N from the activity
--    type). Any change of time or status replaces or removes unsent reminders.
--    Messages are in Taglish. Nothing is sent until Phase 7.
--
-- Errors raised for the app use errcode 22023 with a short code as the message
-- (slot_invalid, slot_closed, slot_past, outside_window, no_active_pregnancy,
-- too_late_to_cancel, not_found). A taken slot raises the unique violation 23505.

-- 1. Closed days -------------------------------------------------------------------

create table if not exists public.closed_day (
  closed_date date primary key,
  reason      text not null check (char_length(trim(reason)) between 1 and 120),
  created_at  timestamptz not null default now()
);

alter table public.closed_day enable row level security;

grant select on public.closed_day to authenticated;
grant insert, update, delete on public.closed_day to authenticated;

drop policy if exists closed_day_select on public.closed_day;
create policy closed_day_select on public.closed_day
  for select to authenticated
  using (true);

drop policy if exists closed_day_admin_insert on public.closed_day;
create policy closed_day_admin_insert on public.closed_day
  for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

drop policy if exists closed_day_admin_update on public.closed_day;
create policy closed_day_admin_update on public.closed_day
  for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

drop policy if exists closed_day_admin_delete on public.closed_day;
create policy closed_day_admin_delete on public.closed_day
  for delete to authenticated
  using (public.current_user_role() = 'ADMIN');

-- 2. Slot rules ----------------------------------------------------------------------

-- The slot an appointment holds: its scheduled time, or its requested time
-- while it is still a request.
create or replace function public.appointment_slot(p_requested timestamptz, p_scheduled timestamptz)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_scheduled, p_requested);
$$;

-- A valid slot: weekday, on the hour or half hour, 8:00-11:30 or 1:00-2:30
-- Manila time, and not a closed day. Returns null when fine, else an error code.
create or replace function public.slot_problem(p_slot timestamptz)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  local_time timestamp := p_slot at time zone 'Asia/Manila';
begin
  if extract(isodow from local_time) > 5
     or extract(second from local_time) <> 0
     or extract(minute from local_time) not in (0, 30)
     or extract(hour from local_time) not in (8, 9, 10, 11, 13, 14) then
    return 'slot_invalid';
  end if;
  if exists (select 1 from public.closed_day where closed_date = local_time::date) then
    return 'slot_closed';
  end if;
  return null;
end;
$$;

revoke execute on function public.slot_problem(timestamptz) from public, anon;
grant execute on function public.slot_problem(timestamptz) to authenticated;

create or replace function public.check_appointment_slot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  problem text;
  role text := public.current_user_role();
  today date := (now() at time zone 'Asia/Manila')::date;
  requested_day date;
begin
  if tg_op = 'INSERT' then
    -- New appointments belong to a current (ACTIVE) pregnancy.
    if not exists (
      select 1 from public.pregnancy
      where pregnancy_id = new.pregnancy_id and pregnancy_status = 'ACTIVE'
    ) then
      raise exception 'no_active_pregnancy' using errcode = '22023';
    end if;

    if role = 'MOTHER' then
      -- A mother's request carries only her preferred time.
      new.scheduled_datetime := null;
      new.reviewed_by := null;
      requested_day := (new.requested_datetime at time zone 'Asia/Manila')::date;
      if requested_day < today + 1 or requested_day > (today + interval '3 months')::date then
        raise exception 'outside_window' using errcode = '22023';
      end if;
    end if;
  end if;

  -- Check each time that is new or changed (cancelling changes no time).
  if tg_op = 'INSERT' or new.requested_datetime is distinct from old.requested_datetime then
    problem := public.slot_problem(new.requested_datetime);
    if problem is not null then
      raise exception '%', problem using errcode = '22023';
    end if;
    if new.requested_datetime <= now() then
      raise exception 'slot_past' using errcode = '22023';
    end if;
  end if;

  if new.scheduled_datetime is not null
     and (tg_op = 'INSERT' or new.scheduled_datetime is distinct from old.scheduled_datetime) then
    problem := public.slot_problem(new.scheduled_datetime);
    if problem is not null then
      raise exception '%', problem using errcode = '22023';
    end if;
    if new.scheduled_datetime <= now() then
      raise exception 'slot_past' using errcode = '22023';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.check_appointment_slot() from public, anon, authenticated;

drop trigger if exists trg_appointment_check_slot on public.appointment;
create trigger trg_appointment_check_slot
  before insert or update on public.appointment
  for each row execute function public.check_appointment_slot();

-- 3. One appointment per slot ------------------------------------------------------

create unique index if not exists appointment_one_per_slot
  on public.appointment (public.appointment_slot(requested_datetime, scheduled_datetime))
  where status <> 'CANCELLED';

-- 4. Mother actions --------------------------------------------------------------------

-- Replaces 0005's version: requests can be cancelled any time; confirmed
-- visits (and proposed new times) until the day before.
create or replace function public.cancel_my_appointment(p_appointment_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  appt record;
  today date := (now() at time zone 'Asia/Manila')::date;
begin
  select a.appointment_id, a.status, a.scheduled_datetime into appt
  from public.appointment as a
  join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
  where a.appointment_id = p_appointment_id
    and p.mother_id = public.current_mother_id()
  for update of a;

  if not found or appt.status not in ('REQUESTED', 'CONFIRMED', 'RESCHEDULED') then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if appt.status in ('CONFIRMED', 'RESCHEDULED')
     and (appt.scheduled_datetime at time zone 'Asia/Manila')::date <= today then
    raise exception 'too_late_to_cancel' using errcode = '22023';
  end if;

  update public.appointment set status = 'CANCELLED' where appointment_id = appt.appointment_id;
end;
$$;

revoke execute on function public.cancel_my_appointment(bigint) from public, anon;
grant execute on function public.cancel_my_appointment(bigint) to authenticated;

-- Accept (it becomes CONFIRMED) or decline (it is cancelled) a new time that
-- staff proposed.
create or replace function public.respond_to_new_time(p_appointment_id bigint, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  appt record;
begin
  select a.appointment_id, a.scheduled_datetime into appt
  from public.appointment as a
  join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
  where a.appointment_id = p_appointment_id
    and p.mother_id = public.current_mother_id()
    and a.status = 'RESCHEDULED'
  for update of a;

  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  if p_accept and appt.scheduled_datetime <= now() then
    raise exception 'slot_past' using errcode = '22023';
  end if;

  update public.appointment
  set status = case when p_accept then 'CONFIRMED'::public.appointment_status else 'CANCELLED'::public.appointment_status end
  where appointment_id = appt.appointment_id;
end;
$$;

revoke execute on function public.respond_to_new_time(bigint, boolean) from public, anon;
grant execute on function public.respond_to_new_time(bigint, boolean) to authenticated;

-- 5. Taken slots ---------------------------------------------------------------------
-- Only the times, never who booked them. At most about 4 months per call.

create or replace function public.taken_slots(p_from date, p_to date)
returns setof timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select public.appointment_slot(a.requested_datetime, a.scheduled_datetime)
  from public.appointment as a
  where public.current_user_role() is not null
    and a.status <> 'CANCELLED'
    and p_to - p_from between 0 and 124
    and public.appointment_slot(a.requested_datetime, a.scheduled_datetime)
        >= (p_from::timestamp at time zone 'Asia/Manila')
    and public.appointment_slot(a.requested_datetime, a.scheduled_datetime)
        < ((p_to + 1)::timestamp at time zone 'Asia/Manila');
$$;

revoke execute on function public.taken_slots(date, date) from public, anon;
grant execute on function public.taken_slots(date, date) to authenticated;

-- 6. SMS queue follows the appointment ----------------------------------------------

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
begin
  if tg_op = 'UPDATE'
     and new.status = old.status
     and new.scheduled_datetime is not distinct from old.scheduled_datetime
     and new.activity_type_id = old.activity_type_id then
    return new;
  end if;

  -- Remove reminders that haven't gone out yet.
  delete from public.sms_reminder
  where appointment_id = new.appointment_id
    and reminder_type = 'UPCOMING'
    and delivery_status = 'PENDING';

  if new.status <> 'CONFIRMED' or new.scheduled_datetime is null or new.scheduled_datetime <= now() then
    return new;
  end if;

  select t.reminder_days_before, t.name into days_before, activity_name
  from public.activity_type as t
  where t.activity_type_id = new.activity_type_id;

  select m.first_name, m.contact_number into first_name, phone
  from public.pregnancy as p
  join public.mother as m on m.mother_id = p.mother_id
  where p.pregnancy_id = new.pregnancy_id;

  local_time := new.scheduled_datetime at time zone 'Asia/Manila';
  send_at := ((local_time::date - coalesce(days_before, 1)) + time '08:00') at time zone 'Asia/Manila';
  -- Booked too late for the usual time: send as soon as possible instead.
  if send_at < now() then
    send_at := now();
  end if;

  insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status)
  values (
    new.appointment_id,
    'UPCOMING',
    phone,
    'Hi ' || first_name || '! Paalala: ' || activity_name || ' mo sa '
      || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
      || ' sa Taysan Health Center. Dalhin ang booklet mo. Salamat! -Taysan MaternaCare',
    send_at,
    'PENDING'
  );
  return new;
end;
$$;

revoke execute on function public.sync_appointment_reminder() from public, anon, authenticated;

drop trigger if exists trg_appointment_sync_reminder on public.appointment;
create trigger trg_appointment_sync_reminder
  after insert or update on public.appointment
  for each row execute function public.sync_appointment_reminder();
