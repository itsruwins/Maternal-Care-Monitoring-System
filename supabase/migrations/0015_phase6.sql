-- 0015_phase6.sql  (Phase 6: missed appointments & follow-ups)
-- Run once in the Supabase SQL editor, after 0001-0014. Safe to run again.
--
-- 1. Turns on pg_cron (Supabase's job scheduler). If this step fails, enable
--    pg_cron in Dashboard → Database → Extensions, then run the file again.
-- 2. Follow-ups (follow_up) get three columns: result (reached her or not),
--    close_reason ("No more follow-up needed": moved away, getting care
--    elsewhere, other) and created_at (when it was logged). Rules:
--    * only on a Missed appointment, logged by the logged-in staff member;
--    * the date is not in the future and not before the missed visit;
--    * health workers can change an entry only on the day it was logged
--      (Manila time), admins any time; only admins delete (unchanged);
--    * only staff can read follow-ups (mothers could read them before).
-- 3. follow_up_item: the staff follow-up list, one row per Missed appointment,
--    with the tries so far and how it ended. It is sorted out when she came in
--    (a visit after the missed time), was rebooked (a newer appointment that
--    isn't cancelled, booked by staff or requested by her), a health worker
--    ticked "No more follow-up needed", or her pregnancy was closed.
-- 4. A missed-visit SMS waits only while its follow-up is open: an unsent one
--    is removed as soon as the follow-up is sorted out.
-- 5. Closing a pregnancy cancels its open appointments (remark "Pregnancy
--    closed") and removes their unsent messages. Pregnancies that are already
--    closed get the same clean-up now.
-- 6. mark_missed_appointments(), run every day at 6:00 PM Manila (10:00 UTC):
--    Confirmed and New-time-sent appointments whose time has passed become
--    Missed, or Completed when she had any visit that day. Missed Confirmed
--    ones get a Taglish missed-visit SMS for 8:00 AM the next morning, unless
--    the miss is more than 2 days old or she was already rebooked. Pregnancies
--    that aren't current are skipped. To test it now:
--      select public.mark_missed_appointments();
-- 7. my_open_missed_visits(): the logged-in mother's open missed visits (for
--    the notice on her pages), without any staff notes.
--
-- Errors for the app use errcode 22023 (or 42501 for "locked") with a short
-- code as the message: appointment_not_missed, no_staff_profile,
-- result_required, follow_up_date_future, follow_up_date_early,
-- close_note_required, follow_up_locked, follow_up_fields_locked.
-- Deleted: only unsent messages that no longer apply.

-- 1. pg_cron ----------------------------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- 2. Follow-up columns and rules ----------------------------------------------------

do $$
begin
  create type public.follow_up_result as enum ('REACHED', 'NOT_REACHED');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.follow_up_close_reason as enum ('MOVED_AWAY', 'CARE_ELSEWHERE', 'OTHER');
exception
  when duplicate_object then null;
end;
$$;

alter table public.follow_up
  add column if not exists result public.follow_up_result,
  add column if not exists close_reason public.follow_up_close_reason,
  add column if not exists created_at timestamptz not null default now();

create or replace function public.check_follow_up()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  role text := public.current_user_role();
  today date := (now() at time zone 'Asia/Manila')::date;
  appt_status public.appointment_status;
  missed_day date;
begin
  select a.status, (a.scheduled_datetime at time zone 'Asia/Manila')::date
  into appt_status, missed_day
  from public.appointment as a
  where a.appointment_id = new.appointment_id;

  if tg_op = 'INSERT' then
    if appt_status is distinct from 'MISSED' then
      raise exception 'appointment_not_missed' using errcode = '22023';
    end if;
    -- Logged by whoever is logged in (only the SQL editor may name someone).
    if role is not null then
      new.health_worker_id := public.current_health_worker_id();
    end if;
    if new.health_worker_id is null then
      raise exception 'no_staff_profile' using errcode = '22023';
    end if;
    new.created_at := now();
  else
    if new.appointment_id is distinct from old.appointment_id
       or new.health_worker_id is distinct from old.health_worker_id
       or new.created_at is distinct from old.created_at then
      raise exception 'follow_up_fields_locked' using errcode = '42501';
    end if;
    if role = 'HEALTH_WORKER' and (old.created_at at time zone 'Asia/Manila')::date <> today then
      raise exception 'follow_up_locked' using errcode = '42501';
    end if;
  end if;

  if new.result is null then
    raise exception 'result_required' using errcode = '22023';
  end if;
  new.follow_up_date := coalesce(new.follow_up_date, today);
  if new.follow_up_date > today then
    raise exception 'follow_up_date_future' using errcode = '22023';
  end if;
  if new.follow_up_date < missed_day then
    raise exception 'follow_up_date_early' using errcode = '22023';
  end if;
  new.outcome_notes := left(trim(coalesce(new.outcome_notes, '')), 500);
  if new.close_reason = 'OTHER' and new.outcome_notes = '' then
    raise exception 'close_note_required' using errcode = '22023';
  end if;
  return new;
end;
$$;

revoke execute on function public.check_follow_up() from public, anon, authenticated;

drop trigger if exists trg_follow_up_check on public.follow_up;
create trigger trg_follow_up_check
  before insert or update on public.follow_up
  for each row execute function public.check_follow_up();

-- Staff only (the old rule also let a mother read the ones about her).
drop policy if exists followup_select_own_or_staff on public.follow_up;
drop policy if exists follow_up_select_staff on public.follow_up;
create policy follow_up_select_staff on public.follow_up
  for select to authenticated
  using (public.current_user_role() in ('ADMIN', 'HEALTH_WORKER'));

-- 3. The follow-up list ---------------------------------------------------------------
-- security_invoker: whoever reads it sees only what their own access rules allow.

create or replace view public.follow_up_item
with (security_invoker = true)
as
select
  a.appointment_id,
  a.pregnancy_id,
  p.mother_id,
  a.activity_type_id,
  t.name as service,
  a.scheduled_datetime as missed_at,
  m.first_name,
  m.middle_name,
  m.last_name,
  m.contact_number,
  m.purok_id,
  pk.name as purok_name,
  tries.attempts,
  tries.last_date as last_follow_up_date,
  tries.last_method,
  tries.last_result,
  ending.ended_how,
  ending.ended_at,
  ending.close_reason,
  ending.rebooked_at,
  ending.ended_how is null as is_open
from public.appointment as a
join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
join public.mother as m on m.mother_id = p.mother_id
join public.activity_type as t on t.activity_type_id = a.activity_type_id
left join public.purok as pk on pk.purok_id = m.purok_id
cross join lateral (
  select
    count(*)::integer as attempts,
    max(f.follow_up_date) as last_date,
    (array_agg(f.method order by f.follow_up_date desc, f.follow_up_id desc))[1] as last_method,
    (array_agg(f.result order by f.follow_up_date desc, f.follow_up_id desc))[1] as last_result
  from public.follow_up as f
  where f.appointment_id = a.appointment_id
) as tries
left join lateral (
  -- How it was sorted out (the first that applies, in this order).
  select e.ended_how, e.ended_at, e.close_reason, e.rebooked_at
  from (
    -- She came in: a visit recorded after the missed time.
    select 1 as priority, 'CAME_IN'::text as ended_how, v.visit_datetime as ended_at,
           null::public.follow_up_close_reason as close_reason, null::timestamptz as rebooked_at
    from public.prenatal_visit as v
    where v.pregnancy_id = a.pregnancy_id
      and v.visit_datetime > a.scheduled_datetime
    union all
    -- Rebooked: a newer appointment that isn't cancelled.
    select 2, 'REBOOKED', b.created_at, null, coalesce(b.scheduled_datetime, b.requested_datetime)
    from public.appointment as b
    where b.pregnancy_id = a.pregnancy_id
      and b.appointment_id <> a.appointment_id
      and b.status <> 'CANCELLED'
      and b.created_at > a.scheduled_datetime
    union all
    -- A health worker ticked "No more follow-up needed".
    select 3, 'CLOSED', f.created_at, f.close_reason, null
    from public.follow_up as f
    where f.appointment_id = a.appointment_id
      and f.close_reason is not null
    union all
    -- Her pregnancy was closed.
    select 4, 'PREGNANCY_CLOSED', p.outcome_date::timestamp at time zone 'Asia/Manila', null, null
    where p.pregnancy_status <> 'ACTIVE'
  ) as e
  order by e.priority, e.ended_at
  limit 1
) as ending on true
where a.status = 'MISSED';

revoke all on public.follow_up_item from anon, authenticated;
grant select on public.follow_up_item to authenticated;

-- 4. Unsent missed-visit messages wait only while the follow-up is open --------------

create or replace function public.drop_closed_missed_notices(p_pregnancy_id bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.sms_reminder as r
  using public.appointment as a
  where a.appointment_id = r.appointment_id
    and a.pregnancy_id = p_pregnancy_id
    and r.reminder_type = 'MISSED_NOTICE'
    and r.delivery_status = 'PENDING'
    and not exists (
      select 1 from public.follow_up_item as i
      where i.appointment_id = r.appointment_id
        and i.is_open
    );
$$;

revoke execute on function public.drop_closed_missed_notices(bigint) from public, anon, authenticated;

-- After anything that can sort out a follow-up: an appointment booked or
-- changed, a visit recorded, a follow-up logged or changed.
create or replace function public.sync_missed_notices()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pregnancy_id bigint;
begin
  if tg_table_name = 'follow_up' then
    select a.pregnancy_id into v_pregnancy_id
    from public.appointment as a
    where a.appointment_id = new.appointment_id;
  else
    v_pregnancy_id := new.pregnancy_id;
  end if;
  perform public.drop_closed_missed_notices(v_pregnancy_id);
  return null;
end;
$$;

revoke execute on function public.sync_missed_notices() from public, anon, authenticated;

drop trigger if exists trg_appointment_missed_notices on public.appointment;
create trigger trg_appointment_missed_notices
  after insert or update of status on public.appointment
  for each row execute function public.sync_missed_notices();

drop trigger if exists trg_prenatal_visit_missed_notices on public.prenatal_visit;
create trigger trg_prenatal_visit_missed_notices
  after insert on public.prenatal_visit
  for each row execute function public.sync_missed_notices();

drop trigger if exists trg_follow_up_missed_notices on public.follow_up;
create trigger trg_follow_up_missed_notices
  after insert or update on public.follow_up
  for each row execute function public.sync_missed_notices();

-- 5. Closing a pregnancy --------------------------------------------------------------
-- Its open appointments are cancelled; the 0009 trigger then removes their
-- unsent reminders, and unsent missed-visit messages go too.

create or replace function public.close_pregnancy_appointments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.pregnancy_status = 'ACTIVE' and new.pregnancy_status <> 'ACTIVE' then
    update public.appointment
    set status = 'CANCELLED',
        remarks = concat_ws(E'\n', nullif(remarks, ''), 'Pregnancy closed')
    where pregnancy_id = new.pregnancy_id
      and status in ('REQUESTED', 'CONFIRMED', 'RESCHEDULED');
    perform public.drop_closed_missed_notices(new.pregnancy_id);
  end if;
  return null;
end;
$$;

revoke execute on function public.close_pregnancy_appointments() from public, anon, authenticated;

drop trigger if exists trg_pregnancy_close_appointments on public.pregnancy;
create trigger trg_pregnancy_close_appointments
  after update of pregnancy_status on public.pregnancy
  for each row execute function public.close_pregnancy_appointments();

-- The same clean-up, once, for pregnancies closed before this migration.
update public.appointment as a
set status = 'CANCELLED',
    remarks = concat_ws(E'\n', nullif(a.remarks, ''), 'Pregnancy closed')
from public.pregnancy as p
where p.pregnancy_id = a.pregnancy_id
  and p.pregnancy_status <> 'ACTIVE'
  and a.status in ('REQUESTED', 'CONFIRMED', 'RESCHEDULED');

-- 6. The daily missed check -------------------------------------------------------------
-- Returns how many appointments it changed.

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
        'Hi ' || appt.first_name || '! Hindi ka nakarating sa ' || appt.service || ' mo noong '
          || to_char(appt.scheduled_datetime at time zone 'Asia/Manila', 'Dy, Mon FMDD')
          || '. Pumunta o tumawag sa health center para sa bagong schedule. Salamat! -Taysan MaternaCare',
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

-- 7. A mother's own open missed visits ----------------------------------------------------

create or replace function public.my_open_missed_visits()
returns table (appointment_id bigint, missed_at timestamptz, service text)
language sql
stable
security definer
set search_path = ''
as $$
  select i.appointment_id::bigint, i.missed_at::timestamptz, i.service::text
  from public.follow_up_item as i
  where i.mother_id = public.current_mother_id()
    and i.is_open
  order by i.missed_at;
$$;

revoke execute on function public.my_open_missed_visits() from public, anon;
grant execute on function public.my_open_missed_visits() to authenticated;

-- Schedule: every day at 10:00 UTC = 6:00 PM Manila. Running this file again
-- replaces the job instead of adding a second one.
select cron.schedule(
  'mark-missed-appointments',
  '0 10 * * *',
  $$select public.mark_missed_appointments();$$
);

-- Let the API see the new columns, view and functions right away.
notify pgrst, 'reload schema';
