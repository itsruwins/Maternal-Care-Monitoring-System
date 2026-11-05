-- 0026_notifications.sql  (Phase 10 step 1: the notification bell)
-- Run once in the Supabase SQL editor, after 0025. Safe to run again.
--
-- 1. notification_type: every kind of update the bell can show.
-- 2. notification: one row per person per update, so each staff member has
--    their own read / unread state. Only the type and a few details (service,
--    time, her name, a count) are stored; the website writes the sentence in
--    English or Filipino when it shows it. Each person reads only their own
--    rows (and nothing while their account is inactive); nobody adds, changes
--    or deletes rows from the website.
-- 3. Who gets what (written by the database itself, like the SMS queue, so
--    every path is covered: staff screens, her own actions, the nightly jobs):
--    * Her (only when her record has a login): staff confirmed, gave a new
--      time for, or declined her request; staff booked, rebooked (after a
--      missed visit), moved or cancelled a visit; the visit reminder (8:00 AM,
--      on the same day as the SMS reminder); a missed visit; a checkup
--      recorded; her pregnancy closed; her password reset by staff.
--    * Every active health worker and admin: a new request; she cancelled a
--      request or visit; she accepted or declined a new time; she signed up
--      on the website; one summary a day of the visits marked missed.
--    * Admins only: texts that failed for good (one notice that counts up
--      until it's read); the SMS phone went offline; HTTPSMS refused texts for
--      the monthly limit; a username locked after 5 failed logins; another
--      admin created a staff account or deactivated / reactivated an account.
--    Nobody is told about their own action.
-- 4. Handled ones are marked read by themselves: a request's "New request"
--    for all staff once it's answered or she cancels it; her "New time"
--    once she answers it or staff change it; "Phone offline" when the phone
--    is back online; "Monthly limit" when texts go through again.
-- 5. For the server (secret key only): notify_password_reset() and
--    notify_account_change(), for the two events the database can't see
--    (password resets and new staff accounts are done through Supabase Auth).
-- 6. For the website: mark_notification_read() and mark_all_notifications_read().
-- 7. Jobs: notify-visit-reminders every day at 8:00 AM Manila (00:00 UTC);
--    clean-notifications every day at 3:00 AM Manila (19:00 UTC) deletes
--    notifications older than 90 days.
--
-- The bell starts empty: nothing is created for past events. Changes no
-- existing data. The SMS functions are not touched.

-- 1. The kinds of notification ---------------------------------------------------------------

do $$
begin
  create type public.notification_type as enum (
    -- For her
    'REQUEST_CONFIRMED',
    'REQUEST_NEW_TIME',
    'REQUEST_DECLINED',
    'VISIT_BOOKED',
    'VISIT_REBOOKED',
    'VISIT_MOVED',
    'VISIT_CANCELLED',
    'VISIT_REMINDER',
    'VISIT_MISSED',
    'CHECKUP_RECORDED',
    'PREGNANCY_CLOSED',
    'PASSWORD_RESET',
    -- For health workers and admins
    'NEW_REQUEST',
    'MOTHER_CANCELLED',
    'NEW_TIME_ACCEPTED',
    'NEW_TIME_DECLINED',
    'MOTHER_SIGNED_UP',
    'MISSED_SUMMARY',
    -- For admins only
    'SMS_FAILED',
    'SMS_PHONE_OFFLINE',
    'SMS_LIMIT_REACHED',
    'ACCOUNT_LOCKED',
    'STAFF_ACCOUNT_CREATED',
    'ACCOUNT_DEACTIVATED',
    'ACCOUNT_REACTIVATED'
  );
exception
  when duplicate_object then null;
end;
$$;

-- 2. The table -------------------------------------------------------------------------------

create table if not exists public.notification (
  notification_id bigint generated always as identity primary key,
  -- Who sees it.
  user_id uuid not null references public.user_account (user_id) on delete cascade,
  notification_type public.notification_type not null,
  -- What it's about (for the link it opens); gone with the record.
  appointment_id bigint references public.appointment (appointment_id) on delete cascade,
  mother_id bigint references public.mother (mother_id) on delete cascade,
  visit_id bigint references public.prenatal_visit (visit_id) on delete cascade,
  -- What the sentence needs, as it was at the time: service, at, mother_name,
  -- was, count, day, status, username, role, target_user_id.
  details jsonb not null default '{}'::jsonb,
  -- Set on the ones made by a job, so running it again adds no second copy.
  dedupe_key text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

comment on table public.notification is
  'In-app notifications (the bell), one row per recipient. Written only by database functions; each user reads their own. Deleted after 90 days.';

-- The bell: newest first, and the unread count.
create index if not exists notification_user_newest_idx
  on public.notification (user_id, created_at desc, notification_id desc);
create index if not exists notification_user_unread_idx
  on public.notification (user_id) where read_at is null;
-- Marking handled ones read, and deletes of the linked records.
create index if not exists notification_appointment_idx
  on public.notification (appointment_id) where appointment_id is not null;
create index if not exists notification_mother_idx
  on public.notification (mother_id) where mother_id is not null;
create index if not exists notification_visit_idx
  on public.notification (visit_id) where visit_id is not null;
-- The 90-day clean-up.
create index if not exists notification_created_idx
  on public.notification (created_at);
-- One copy per person for the job-made ones.
create unique index if not exists notification_dedupe_idx
  on public.notification (user_id, dedupe_key) where dedupe_key is not null;

alter table public.notification enable row level security;

revoke all on table public.notification from public, anon, authenticated;
grant select on table public.notification to authenticated;
grant select, insert, update, delete on table public.notification to service_role;

-- Her own rows only, and none while her account is inactive.
drop policy if exists notification_select_own on public.notification;
create policy notification_select_own on public.notification
  for select to authenticated
  using (user_id = (select auth.uid()) and public.current_user_role() is not null);

-- 3. Helpers (database only) -----------------------------------------------------------------

-- One notification for one person (nothing when there's no login).
create or replace function public.add_notification(
  p_user_id uuid,
  p_type public.notification_type,
  p_details jsonb default '{}'::jsonb,
  p_appointment_id bigint default null,
  p_mother_id bigint default null,
  p_visit_id bigint default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notification (user_id, notification_type, details, appointment_id, mother_id, visit_id)
  select p_user_id, p_type, coalesce(p_details, '{}'::jsonb), p_appointment_id, p_mother_id, p_visit_id
  where p_user_id is not null;
$$;

revoke execute on function public.add_notification(uuid, public.notification_type, jsonb, bigint, bigint, bigint)
  from public, anon, authenticated;

-- The same notification for every active health worker and admin (or admins
-- only), except whoever did it.
create or replace function public.notify_staff(
  p_type public.notification_type,
  p_details jsonb default '{}'::jsonb,
  p_admins_only boolean default false,
  p_appointment_id bigint default null,
  p_mother_id bigint default null,
  p_except uuid default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notification (user_id, notification_type, details, appointment_id, mother_id)
  select u.user_id, p_type, coalesce(p_details, '{}'::jsonb), p_appointment_id, p_mother_id
  from public.user_account as u
  where u.account_status = 'ACTIVE'
    and u.role in ('ADMIN', 'HEALTH_WORKER')
    and (not p_admins_only or u.role = 'ADMIN')
    and u.user_id is distinct from coalesce(p_except, (select auth.uid()));
$$;

revoke execute on function public.notify_staff(public.notification_type, jsonb, boolean, bigint, bigint, uuid)
  from public, anon, authenticated;

-- A notice that counts up, for each active admin (or every staff member):
-- * without a day (failed texts): adds 1 to their unread one, or starts a new
--   one at 1 once they've read the last;
-- * with a day (missed visits): one per day; adding to it makes it unread and
--   newest again.
create or replace function public.count_up_staff_notice(
  p_type public.notification_type,
  p_admins_only boolean,
  p_day date default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_id uuid;
  day_key text := case when p_day is not null then p_type::text || ':' || p_day::text end;
begin
  for staff_id in
    select u.user_id
    from public.user_account as u
    where u.account_status = 'ACTIVE'
      and u.role in ('ADMIN', 'HEALTH_WORKER')
      and (not p_admins_only or u.role = 'ADMIN')
  loop
    if day_key is null then
      update public.notification as n
      set details = jsonb_build_object('count', coalesce((n.details ->> 'count')::integer, 0) + 1),
          created_at = now()
      where n.user_id = staff_id
        and n.notification_type = p_type
        and n.dedupe_key is null
        and n.read_at is null;
    else
      update public.notification as n
      set details = jsonb_build_object('count', coalesce((n.details ->> 'count')::integer, 0) + 1, 'day', p_day),
          created_at = now(),
          read_at = null
      where n.user_id = staff_id
        and n.dedupe_key = day_key;
    end if;
    if not found then
      insert into public.notification (user_id, notification_type, details, dedupe_key)
      values (
        staff_id,
        p_type,
        case when p_day is null then jsonb_build_object('count', 1)
             else jsonb_build_object('count', 1, 'day', p_day) end,
        day_key
      );
    end if;
  end loop;
end;
$$;

revoke execute on function public.count_up_staff_notice(public.notification_type, boolean, date)
  from public, anon, authenticated;

-- 4. Appointments: requests, answers, bookings, changes, missed visits ------------------------
-- Staff actions tell her (the same cases as her texts); her own actions tell
-- the staff; the nightly missed check tells both.

create or replace function public.notify_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor text := public.current_user_role();
  mom record;
  service text;
  for_her public.notification_type;
  for_staff public.notification_type;
  her_time timestamptz := coalesce(new.scheduled_datetime, new.requested_datetime);
  staff_time timestamptz := coalesce(new.scheduled_datetime, new.requested_datetime);
begin
  if tg_op = 'UPDATE'
     and new.status = old.status
     and new.scheduled_datetime is not distinct from old.scheduled_datetime then
    return null;
  end if;

  select m.mother_id, m.user_id, trim(m.first_name || ' ' || m.last_name) as full_name,
         p.pregnancy_status = 'ACTIVE' as is_active
    into mom
  from public.pregnancy as p
  join public.mother as m on m.mother_id = p.mother_id
  where p.pregnancy_id = new.pregnancy_id;

  select t.name into service
  from public.activity_type as t
  where t.activity_type_id = new.activity_type_id;

  -- Handled ones are read for everyone.
  if tg_op = 'UPDATE' then
    if old.status = 'REQUESTED' and new.status <> 'REQUESTED' then
      update public.notification
      set read_at = now()
      where appointment_id = new.appointment_id
        and notification_type = 'NEW_REQUEST'
        and read_at is null;
    end if;
    if old.status = 'RESCHEDULED' then
      update public.notification
      set read_at = now()
      where appointment_id = new.appointment_id
        and notification_type = 'REQUEST_NEW_TIME'
        and read_at is null;
    end if;
  end if;

  if actor in ('ADMIN', 'HEALTH_WORKER') then
    if tg_op = 'INSERT' then
      -- Staff booked a visit for her: a rebook when it sorts out a missed visit.
      if new.status = 'CONFIRMED' and new.scheduled_datetime > now() then
        if exists (
          select 1 from public.follow_up_item as i
          where i.pregnancy_id = new.pregnancy_id
            and i.ended_how = 'REBOOKED'
            and i.ended_at = new.created_at
        ) then
          for_her := 'VISIT_REBOOKED';
        else
          for_her := 'VISIT_BOOKED';
        end if;
      end if;
    elsif old.status = 'REQUESTED' then
      -- Staff answered her waiting request.
      for_her := (
        case new.status
          when 'CONFIRMED' then 'REQUEST_CONFIRMED'
          when 'RESCHEDULED' then 'REQUEST_NEW_TIME'
          when 'CANCELLED' then 'REQUEST_DECLINED'
        end
      )::public.notification_type;
      if for_her = 'REQUEST_DECLINED' then
        her_time := new.requested_datetime;
      end if;
    elsif old.status in ('CONFIRMED', 'RESCHEDULED') then
      -- Staff moved or cancelled a visit (or a new time she hasn't answered).
      if new.status = 'RESCHEDULED'
         and (old.status = 'CONFIRMED' or new.scheduled_datetime is distinct from old.scheduled_datetime) then
        for_her := 'REQUEST_NEW_TIME';
      elsif new.status = 'CONFIRMED'
         and new.scheduled_datetime is distinct from old.scheduled_datetime then
        for_her := 'VISIT_MOVED';
      elsif new.status = 'CANCELLED'
         and coalesce(old.scheduled_datetime, old.requested_datetime) > now() then
        for_her := 'VISIT_CANCELLED';
        her_time := coalesce(old.scheduled_datetime, old.requested_datetime);
      end if;
    end if;
    -- Closing her pregnancy cancels her open visits: "Pregnancy closed" says it.
    if not mom.is_active then
      for_her := null;
    end if;
  elsif actor = 'MOTHER' then
    if tg_op = 'INSERT' then
      if new.status = 'REQUESTED' then
        for_staff := 'NEW_REQUEST';
      end if;
    elsif old.status = 'RESCHEDULED' and new.status = 'CONFIRMED' then
      for_staff := 'NEW_TIME_ACCEPTED';
    elsif old.status = 'RESCHEDULED' and new.status = 'CANCELLED' then
      -- Declining the new time, or cancelling it: the same to staff.
      for_staff := 'NEW_TIME_DECLINED';
      staff_time := old.scheduled_datetime;
    elsif old.status in ('REQUESTED', 'CONFIRMED') and new.status = 'CANCELLED' then
      for_staff := 'MOTHER_CANCELLED';
      staff_time := coalesce(old.scheduled_datetime, old.requested_datetime);
    end if;
  end if;

  -- The nightly check marked it missed (whoever runs it).
  if tg_op = 'UPDATE'
     and new.status = 'MISSED'
     and old.status in ('CONFIRMED', 'RESCHEDULED')
     and mom.is_active then
    perform public.count_up_staff_notice('MISSED_SUMMARY', false, (now() at time zone 'Asia/Manila')::date);
    -- Her notice: only for a time she agreed to, like the missed-visit text.
    if old.status = 'CONFIRMED' then
      for_her := 'VISIT_MISSED';
      her_time := new.scheduled_datetime;
    end if;
  end if;

  if for_her is not null then
    perform public.add_notification(
      mom.user_id,
      for_her,
      jsonb_build_object('service', service, 'at', her_time),
      new.appointment_id,
      mom.mother_id
    );
  end if;

  if for_staff is not null then
    perform public.notify_staff(
      for_staff,
      jsonb_build_object(
        'service', service,
        'at', staff_time,
        'mother_name', mom.full_name,
        'was', case when tg_op = 'UPDATE' then old.status::text end
      ),
      false,
      new.appointment_id,
      mom.mother_id
    );
  end if;

  return null;
end;
$$;

revoke execute on function public.notify_appointment_change() from public, anon, authenticated;

drop trigger if exists trg_appointment_notify on public.appointment;
create trigger trg_appointment_notify
  after insert or update on public.appointment
  for each row execute function public.notify_appointment_change();

-- 5. A checkup recorded ----------------------------------------------------------------------

create or replace function public.notify_visit_recorded()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  mom record;
begin
  select m.mother_id, m.user_id into mom
  from public.pregnancy as p
  join public.mother as m on m.mother_id = p.mother_id
  where p.pregnancy_id = new.pregnancy_id;

  perform public.add_notification(
    mom.user_id,
    'CHECKUP_RECORDED',
    jsonb_build_object('at', new.visit_datetime),
    null,
    mom.mother_id,
    new.visit_id
  );
  return null;
end;
$$;

revoke execute on function public.notify_visit_recorded() from public, anon, authenticated;

drop trigger if exists trg_prenatal_visit_notify on public.prenatal_visit;
create trigger trg_prenatal_visit_notify
  after insert on public.prenatal_visit
  for each row execute function public.notify_visit_recorded();

-- 6. Her pregnancy closed --------------------------------------------------------------------
-- Only the new status (Delivered or Ended) is kept, never the outcome.

create or replace function public.notify_pregnancy_closed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  mom record;
begin
  if old.pregnancy_status = 'ACTIVE' and new.pregnancy_status <> 'ACTIVE' then
    select m.mother_id, m.user_id into mom
    from public.mother as m
    where m.mother_id = new.mother_id;

    perform public.add_notification(
      mom.user_id,
      'PREGNANCY_CLOSED',
      jsonb_build_object('status', new.pregnancy_status::text),
      null,
      mom.mother_id
    );
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_pregnancy_closed() from public, anon, authenticated;

drop trigger if exists trg_pregnancy_notify on public.pregnancy;
create trigger trg_pregnancy_notify
  after update of pregnancy_status on public.pregnancy
  for each row execute function public.notify_pregnancy_closed();

-- 7. She signed up on the website ------------------------------------------------------------
-- The website sign-up runs on the server with the secret key (nobody logged
-- in) and leaves registered_by empty; a record added at the health center is
-- added by a logged-in staff member.

create or replace function public.notify_mother_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is not null
     and new.registered_by is null
     and public.current_user_role() is null then
    perform public.notify_staff(
      'MOTHER_SIGNED_UP',
      jsonb_build_object('mother_name', trim(new.first_name || ' ' || new.last_name)),
      false,
      null,
      new.mother_id
    );
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_mother_signup() from public, anon, authenticated;

drop trigger if exists trg_mother_notify_signup on public.mother;
create trigger trg_mother_notify_signup
  after insert on public.mother
  for each row execute function public.notify_mother_signup();

-- 8. SMS problems (admins) -------------------------------------------------------------------

-- A text failed for good (automatic retries wait as Pending, so Failed is final).
create or replace function public.notify_sms_failed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.delivery_status = 'FAILED' and old.delivery_status is distinct from 'FAILED' then
    perform public.count_up_staff_notice('SMS_FAILED', true);
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_sms_failed() from public, anon, authenticated;

drop trigger if exists trg_sms_reminder_notify_failed on public.sms_reminder;
create trigger trg_sms_reminder_notify_failed
  after update of delivery_status on public.sms_reminder
  for each row execute function public.notify_sms_failed();

-- The phone went offline / came back; HTTPSMS refused texts for the monthly
-- limit / texts go through again.
create or replace function public.notify_sms_setting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.phone_online is false and old.phone_online is distinct from false then
    perform public.notify_staff(
      'SMS_PHONE_OFFLINE',
      jsonb_build_object('at', coalesce(new.phone_status_at, now())),
      true
    );
  elsif new.phone_online is true and old.phone_online is distinct from true then
    update public.notification
    set read_at = now()
    where notification_type = 'SMS_PHONE_OFFLINE'
      and read_at is null;
  end if;

  if new.limit_reached_at is not null and old.limit_reached_at is null then
    perform public.notify_staff(
      'SMS_LIMIT_REACHED',
      jsonb_build_object('at', new.limit_reached_at),
      true
    );
  elsif new.limit_reached_at is null and old.limit_reached_at is not null then
    update public.notification
    set read_at = now()
    where notification_type = 'SMS_LIMIT_REACHED'
      and read_at is null;
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_sms_setting() from public, anon, authenticated;

drop trigger if exists trg_sms_setting_notify on public.sms_setting;
create trigger trg_sms_setting_notify
  after update on public.sms_setting
  for each row execute function public.notify_sms_setting();

-- 9. A username locked (admins) --------------------------------------------------------------
-- On the 5th failed login within 15 minutes (the login stops counting while
-- it's locked), and only for a username that exists.

create or replace function public.notify_login_locked()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  acct record;
begin
  if (
    select count(*)
    from public.login_attempt as l
    where l.username = new.username
      and l.attempted_at > now() - interval '15 minutes'
  ) = 5 then
    select u.user_id, u.username, u.role into acct
    from public.user_account as u
    where u.username = lower(new.username);
    if found then
      perform public.notify_staff(
        'ACCOUNT_LOCKED',
        jsonb_build_object('username', acct.username, 'role', acct.role::text, 'target_user_id', acct.user_id),
        true
      );
    end if;
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_login_locked() from public, anon, authenticated;

drop trigger if exists trg_login_attempt_notify on public.login_attempt;
create trigger trg_login_attempt_notify
  after insert on public.login_attempt
  for each row execute function public.notify_login_locked();

-- 10. Account changes by an admin (other admins) ---------------------------------------------
-- Used by the trigger below (Admin -> Accounts saves the status as the
-- logged-in admin) and by the server for what it does with the secret key
-- (new staff accounts; a login turned off from her record), which passes who
-- did it. Only an admin's actions count.

create or replace function public.notify_account_change(
  p_type public.notification_type,
  p_user_id uuid,
  p_by uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  acct record;
begin
  if p_type not in ('STAFF_ACCOUNT_CREATED', 'ACCOUNT_DEACTIVATED', 'ACCOUNT_REACTIVATED') then
    raise exception 'wrong_type' using errcode = '22023';
  end if;
  if p_by is null or not exists (
    select 1 from public.user_account as u
    where u.user_id = p_by and u.role = 'ADMIN' and u.account_status = 'ACTIVE'
  ) then
    return;
  end if;

  select u.user_id, u.username, u.role into acct
  from public.user_account as u
  where u.user_id = p_user_id;
  if not found then
    return;
  end if;

  perform public.notify_staff(
    p_type,
    jsonb_build_object('username', acct.username, 'role', acct.role::text, 'target_user_id', acct.user_id),
    true,
    null,
    null,
    p_by
  );
end;
$$;

revoke execute on function public.notify_account_change(public.notification_type, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.notify_account_change(public.notification_type, uuid, uuid) to service_role;

create or replace function public.notify_account_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.account_status is distinct from old.account_status and (select auth.uid()) is not null then
    perform public.notify_account_change(
      case when new.account_status = 'ACTIVE' then 'ACCOUNT_REACTIVATED' else 'ACCOUNT_DEACTIVATED' end::public.notification_type,
      new.user_id,
      (select auth.uid())
    );
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_account_status() from public, anon, authenticated;

drop trigger if exists trg_user_account_notify_status on public.user_account;
create trigger trg_user_account_notify_status
  after update of account_status on public.user_account
  for each row execute function public.notify_account_status();

-- 11. A password reset by staff (the account's owner) ----------------------------------------
-- Called by the server after it resets a password with the secret key.

create or replace function public.notify_password_reset(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  select public.add_notification(p_user_id, 'PASSWORD_RESET');
$$;

revoke execute on function public.notify_password_reset(uuid) from public, anon, authenticated;
grant execute on function public.notify_password_reset(uuid) to service_role;

-- 12. Reading them (the website) -------------------------------------------------------------

create or replace function public.mark_notification_read(p_notification_id bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notification
  set read_at = now()
  where notification_id = p_notification_id
    and user_id = (select auth.uid())
    and public.current_user_role() is not null
    and read_at is null;
$$;

revoke execute on function public.mark_notification_read(bigint) from public, anon;
grant execute on function public.mark_notification_read(bigint) to authenticated;

-- Returns how many it marked.
create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  update public.notification
  set read_at = now()
  where user_id = (select auth.uid())
    and public.current_user_role() is not null
    and read_at is null;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke execute on function public.mark_all_notifications_read() from public, anon;
grant execute on function public.mark_all_notifications_read() to authenticated;

-- 13. The visit reminder (8:00 AM Manila) ----------------------------------------------------
-- Her confirmed visits whose reminder day is today, on the same day as the SMS
-- reminder (the service's "days before"). A visit booked after the job has
-- run needs none: its Booked / Confirmed / Moved notice gives the time.
-- Returns how many it added; running it again adds none.

create or replace function public.notify_visit_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Manila')::date;
  added integer;
begin
  insert into public.notification (user_id, notification_type, details, appointment_id, mother_id, dedupe_key)
  select m.user_id,
         'VISIT_REMINDER',
         jsonb_build_object('service', t.name, 'at', a.scheduled_datetime),
         a.appointment_id,
         m.mother_id,
         'reminder:' || a.appointment_id || ':' || extract(epoch from a.scheduled_datetime)::bigint
  from public.appointment as a
  join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
  join public.mother as m on m.mother_id = p.mother_id
  join public.activity_type as t on t.activity_type_id = a.activity_type_id
  where a.status = 'CONFIRMED'
    and a.scheduled_datetime > now()
    and p.pregnancy_status = 'ACTIVE'
    and m.user_id is not null
    and (a.scheduled_datetime at time zone 'Asia/Manila')::date - coalesce(t.reminder_days_before, 1) = today
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
  get diagnostics added = row_count;
  return added;
end;
$$;

revoke execute on function public.notify_visit_reminders() from public, anon, authenticated;

-- 14. Clean-up (90 days) ---------------------------------------------------------------------

create or replace function public.clean_notifications()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.notification where created_at < now() - interval '90 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke execute on function public.clean_notifications() from public, anon, authenticated;

-- 15. Jobs -----------------------------------------------------------------------------------
-- Running this file again replaces the jobs instead of adding second ones.

-- Every day at 00:00 UTC = 8:00 AM Manila (when the SMS reminders go).
select cron.schedule(
  'notify-visit-reminders',
  '0 0 * * *',
  $$select public.notify_visit_reminders();$$
);

-- Every day at 19:00 UTC = 3:00 AM Manila (with clean-rate-limits).
select cron.schedule(
  'clean-notifications',
  '0 19 * * *',
  $$select public.clean_notifications();$$
);

-- Let the API see the new table and functions right away.
notify pgrst, 'reload schema';
