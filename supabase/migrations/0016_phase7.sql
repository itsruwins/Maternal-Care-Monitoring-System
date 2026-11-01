-- 0016_phase7.sql  (Phase 7: SMS reminders through HTTPSMS)
-- Run once in the Supabase SQL editor, after 0001-0015. Safe to run again.
--
-- 1. Turns on pg_net (lets the database call a web address). If this step
--    fails, enable pg_net in Dashboard → Database → Extensions, then run the
--    file again.
-- 2. A new text status, SKIPPED: not sent, on purpose, with the reason.
-- 3. Each text (sms_reminder) gains: attempt_count (tries so far),
--    next_attempt_at (when an automatic retry is due; the text is Pending
--    again meanwhile and scheduled_at keeps its first time), claimed_at (taken
--    by a sender run), sent_to (the number it actually went to: the test
--    number in Test mode), delivered_at, status_checked_at (when HTTPSMS was
--    last asked about it), status_reason (a short code the app shows in
--    English or Filipino; error_message keeps HTTPSMS's own error text).
--    The sender clears claimed_at when it saves a result.
-- 4. SMS settings (sms_setting, one row, admins only): Test or Live (starts in
--    Test), the test number, who changed them and when. The sender keeps the
--    phone's online / offline status and when HTTPSMS last refused texts for
--    the monthly limit; admins can't change those.
-- 5. Who writes texts: staff can no longer add or change them (the old
--    sms_insert_staff and sms_update_staff rules are removed). Only the
--    database's own functions and the server sender write them.
-- 6. sms_plain(): texts are built with plain characters only (accents
--    dropped, ñ stays; no curly quotes, long dashes or no-break spaces).
-- 7. sms_skip_reason(): one too-late check, used by both 8 and 9. A visit
--    reminder is too late once the visit time has passed, or when the visit
--    was cancelled or moved; a missed-visit notice when it is more than 1 day
--    late or her follow-up is already sorted out.
-- 8. retry_sms(): admins put a Failed text back in the queue (to her current
--    number), only while it is still in time.
-- 9. claim_due_sms(), for the server sender only: marks due texts that are
--    too late Skipped, then takes at most 20 due texts, inside sending hours
--    (8:00 AM to 8:00 PM Manila; any time in Test mode). Each one is locked for
--    10 minutes, so two runs never take the same text and a crashed run
--    doesn't leave texts stuck.
-- 10. New wording: "sa health center" and "Salamat! -Brgy. Taysan Health
--    Center", for new texts and for texts still waiting. A text that was
--    already tried once is kept as Skipped (instead of removed) when its visit
--    is moved or cancelled, or its follow-up is sorted out.
-- 11. When a mother's mobile number changes, her waiting texts move to the
--    new number. Sent ones keep the number they went to.
-- 12. The schedule: job send-sms every 5 minutes from 8:00 AM to 7:55 PM
--    Manila (*/5 0-11 * * * in UTC). It calls the sender address kept in
--    Vault ('sms_sender_url') with Authorization: Bearer <'cron_secret'>, and
--    does nothing until both are set (see docs/database-setup.md).
--
-- Errors for the app use errcode 22023 (42501 for "not allowed", P0002 for
-- "not found") with a short code as the message: not_allowed, not_found,
-- not_failed, too_late.
--
-- SKIPPED is new in this file, so the database only accepts it after the file
-- has run: everything that uses it is plpgsql and none of it runs here.

-- 1. pg_net -------------------------------------------------------------------------

create extension if not exists pg_net with schema extensions;

-- 2. Skipped ------------------------------------------------------------------------

alter type public.sms_delivery_status add value if not exists 'SKIPPED';

-- 3. New columns on each text ---------------------------------------------------------

alter table public.sms_reminder
  add column if not exists attempt_count integer not null default 0 check (attempt_count >= 0),
  add column if not exists next_attempt_at timestamptz,
  add column if not exists claimed_at timestamptz,
  add column if not exists sent_to text,
  add column if not exists delivered_at timestamptz,
  add column if not exists status_checked_at timestamptz,
  add column if not exists status_reason text check (status_reason ~ '^[a-z_]{1,40}$');

-- Waiting texts, by the time they are due.
create index if not exists sms_reminder_due
  on public.sms_reminder ((coalesce(next_attempt_at, scheduled_at)))
  where delivery_status = 'PENDING';

-- 4. SMS settings ---------------------------------------------------------------------

do $$
begin
  create type public.sms_mode as enum ('TEST', 'LIVE');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.sms_setting (
  setting_id       smallint primary key default 1 check (setting_id = 1),
  mode             public.sms_mode not null default 'TEST',
  test_number      text check (test_number ~ '^09[0-9]{9}$'),
  updated_by       uuid references public.user_account (user_id) on delete set null,
  updated_at       timestamptz not null default now(),
  phone_online     boolean,
  phone_status_at  timestamptz,
  limit_reached_at timestamptz
);

insert into public.sms_setting (setting_id) values (1) on conflict do nothing;

alter table public.sms_setting enable row level security;

-- Admins read the row and change only Test / Live and the test number; the
-- server sender (service_role) keeps the phone and plan status.
revoke all on public.sms_setting from public, anon, authenticated;
grant select on public.sms_setting to authenticated;
grant update (mode, test_number) on public.sms_setting to authenticated;
grant select, update on public.sms_setting to service_role;

drop policy if exists sms_setting_select_admin on public.sms_setting;
create policy sms_setting_select_admin on public.sms_setting
  for select to authenticated
  using (public.current_user_role() = 'ADMIN');

drop policy if exists sms_setting_update_admin on public.sms_setting;
create policy sms_setting_update_admin on public.sms_setting
  for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

-- Who changed Test / Live or the test number, and when.
create or replace function public.stamp_sms_setting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.mode is distinct from old.mode or new.test_number is distinct from old.test_number then
    new.updated_by := auth.uid();
    new.updated_at := now();
  else
    new.updated_by := old.updated_by;
    new.updated_at := old.updated_at;
  end if;
  return new;
end;
$$;

revoke execute on function public.stamp_sms_setting() from public, anon, authenticated;

drop trigger if exists trg_sms_setting_stamp on public.sms_setting;
create trigger trg_sms_setting_stamp
  before update on public.sms_setting
  for each row execute function public.stamp_sms_setting();

-- 5. Who writes texts -------------------------------------------------------------------
-- Every function that writes sms_reminder is security definer, and the app only
-- reads it. Reading (sms_select_own_or_staff) and admin delete stay as they are.

drop policy if exists sms_insert_staff on public.sms_reminder;
drop policy if exists sms_update_staff on public.sms_reminder;
revoke insert, update on public.sms_reminder from anon, authenticated;

-- 6. Plain characters -------------------------------------------------------------------
-- Keeps a text in the plain SMS character set, so each part holds 160
-- characters: accents dropped (ñ stays), curly quotes and long dashes made
-- plain, no-break spaces made normal, invisible joiners removed.

create or replace function public.sms_plain(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(regexp_replace(
    replace(replace(replace(replace(
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
    '[[:space:]]+', ' ', 'g'
  ));
$$;

revoke execute on function public.sms_plain(text) from public, anon, authenticated;

-- 7. The too-late check -------------------------------------------------------------------
-- Returns null when the text may still go out, else the reason:
-- visit_passed, visit_changed (cancelled, moved or no longer confirmed),
-- notice_late (a missed-visit notice more than 1 day late), follow_up_closed.

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

  if r.reminder_type = 'UPCOMING' then
    select a.status, a.scheduled_datetime into appt
    from public.appointment as a
    where a.appointment_id = r.appointment_id;
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
  else
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
  end if;

  return null;
end;
$$;

revoke execute on function public.sms_skip_reason(bigint) from public, anon, authenticated;

-- 8. Retry (admins) ----------------------------------------------------------------------------
-- A Failed text goes back in the queue, to her current number (so a fixed
-- number works). Automatic retries are Pending, so Failed is always final.

create or replace function public.retry_sms(p_reminder_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  if public.current_user_role() is distinct from 'ADMIN' then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  select s.reminder_id, s.delivery_status into r
  from public.sms_reminder as s
  where s.reminder_id = p_reminder_id
  for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if r.delivery_status <> 'FAILED' then
    raise exception 'not_failed' using errcode = '22023';
  end if;
  if public.sms_skip_reason(r.reminder_id) is not null then
    raise exception 'too_late' using errcode = '22023';
  end if;

  update public.sms_reminder as s
  set delivery_status = 'PENDING',
      next_attempt_at = now(),
      claimed_at = null,
      recipient_number = m.contact_number
  from public.appointment as a
  join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
  join public.mother as m on m.mother_id = p.mother_id
  where s.reminder_id = r.reminder_id
    and a.appointment_id = s.appointment_id;
end;
$$;

revoke execute on function public.retry_sms(bigint) from public, anon;
grant execute on function public.retry_sms(bigint) to authenticated;

-- 9. Taking due texts (server sender only) --------------------------------------------------
-- A text is due at next_attempt_at (an automatic retry) or else scheduled_at.
-- Taking one counts as a try and locks it for 10 minutes; a run that crashes
-- before saving a result leaves it to be taken again after that.

create or replace function public.claim_due_sms()
returns setof public.sms_reminder
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_mode public.sms_mode;
  local_time time := (now() at time zone 'Asia/Manila')::time;
  due record;
  reason text;
begin
  select s.mode into current_mode from public.sms_setting as s where s.setting_id = 1;

  -- Too late: marked Skipped with the reason, never sent.
  for due in
    select s.reminder_id
    from public.sms_reminder as s
    where s.delivery_status = 'PENDING'
      and coalesce(s.next_attempt_at, s.scheduled_at) <= now()
      and (s.claimed_at is null or s.claimed_at < now() - interval '10 minutes')
    for update skip locked
  loop
    reason := public.sms_skip_reason(due.reminder_id);
    if reason is not null then
      update public.sms_reminder
      set delivery_status = 'SKIPPED',
          status_reason = reason,
          next_attempt_at = null,
          claimed_at = null
      where reminder_id = due.reminder_id;
    end if;
  end loop;

  -- Live texts go 8:00 AM to 8:00 PM Manila; Test mode (the test number
  -- only) any time. No settings row counts as Test.
  if current_mode = 'LIVE' and (local_time < time '08:00' or local_time >= time '20:00') then
    return;
  end if;

  return query
  with claimed as (
    update public.sms_reminder as s
    set claimed_at = now(),
        attempt_count = s.attempt_count + 1
    where s.reminder_id in (
      select c.reminder_id
      from public.sms_reminder as c
      where c.delivery_status = 'PENDING'
        and coalesce(c.next_attempt_at, c.scheduled_at) <= now()
        and (c.claimed_at is null or c.claimed_at < now() - interval '10 minutes')
      order by coalesce(c.next_attempt_at, c.scheduled_at), c.reminder_id
      limit 20
      for update skip locked
    )
    returning s.*
  )
  select * from claimed;
end;
$$;

revoke execute on function public.claim_due_sms() from public, anon, authenticated;
grant execute on function public.claim_due_sms() to service_role;

-- 10. New wording ----------------------------------------------------------------------------

-- Replaces 0009's version: new wording in plain characters. Unsent reminders
-- of a changed visit: never tried ones are removed (as before), ones already
-- tried are kept as Skipped, and one being sent right now is left for the
-- sender (the next run skips it if it has to try again).
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

  delete from public.sms_reminder
  where appointment_id = new.appointment_id
    and reminder_type = 'UPCOMING'
    and delivery_status = 'PENDING'
    and attempt_count = 0;

  update public.sms_reminder
  set delivery_status = 'SKIPPED',
      status_reason = 'visit_changed',
      next_attempt_at = null
  where appointment_id = new.appointment_id
    and reminder_type = 'UPCOMING'
    and delivery_status = 'PENDING'
    and (claimed_at is null or claimed_at < now() - interval '10 minutes');

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
    public.sms_plain(
      'Hi ' || first_name || '! Paalala: ' || activity_name || ' mo sa '
        || to_char(local_time, 'Dy, Mon FMDD, FMHH12:MI AM')
        || ' sa health center. Dalhin ang booklet mo. Salamat! -Brgy. Taysan Health Center'
    ),
    send_at,
    'PENDING'
  );
  return new;
end;
$$;

revoke execute on function public.sync_appointment_reminder() from public, anon, authenticated;

-- Replaces 0015's version (now plpgsql): unsent missed-visit notices whose
-- follow-up is sorted out. Never tried ones are removed, ones already tried
-- are kept as Skipped, one being sent right now is left for the sender.
create or replace function public.drop_closed_missed_notices(p_pregnancy_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.sms_reminder as r
  using public.appointment as a
  where a.appointment_id = r.appointment_id
    and a.pregnancy_id = p_pregnancy_id
    and r.reminder_type = 'MISSED_NOTICE'
    and r.delivery_status = 'PENDING'
    and r.attempt_count = 0
    and not exists (
      select 1 from public.follow_up_item as i
      where i.appointment_id = r.appointment_id
        and i.is_open
    );

  update public.sms_reminder as r
  set delivery_status = 'SKIPPED',
      status_reason = 'follow_up_closed',
      next_attempt_at = null
  from public.appointment as a
  where a.appointment_id = r.appointment_id
    and a.pregnancy_id = p_pregnancy_id
    and r.reminder_type = 'MISSED_NOTICE'
    and r.delivery_status = 'PENDING'
    and (r.claimed_at is null or r.claimed_at < now() - interval '10 minutes')
    and not exists (
      select 1 from public.follow_up_item as i
      where i.appointment_id = r.appointment_id
        and i.is_open
    );
end;
$$;

revoke execute on function public.drop_closed_missed_notices(bigint) from public, anon, authenticated;

-- Replaces 0015's version: only the message wording changed (plain
-- characters, "-Brgy. Taysan Health Center").
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
          'Hi ' || appt.first_name || '! Hindi ka nakarating sa ' || appt.service || ' mo noong '
            || to_char(appt.scheduled_datetime at time zone 'Asia/Manila', 'Dy, Mon FMDD')
            || '. Pumunta o tumawag sa health center para sa bagong schedule. Salamat! -Brgy. Taysan Health Center'
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

-- Texts still waiting get the new wording too (each is changed only once).
update public.sms_reminder
set message_text = public.sms_plain(
      replace(
        replace(message_text, ' sa Taysan Health Center. ', ' sa health center. '),
        '-Taysan MaternaCare', '-Brgy. Taysan Health Center'
      )
    )
where delivery_status = 'PENDING'
  and message_text like '%-Taysan MaternaCare';

-- 11. Her number changes ----------------------------------------------------------------------
-- Waiting texts (also one being sent right now, so a retry uses the new
-- number) follow her record; sent ones keep the number they went to.

create or replace function public.follow_mother_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.sms_reminder as s
  set recipient_number = new.contact_number
  from public.appointment as a
  join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
  where a.appointment_id = s.appointment_id
    and p.mother_id = new.mother_id
    and s.delivery_status = 'PENDING';
  return null;
end;
$$;

revoke execute on function public.follow_mother_number() from public, anon, authenticated;

drop trigger if exists trg_mother_sms_number on public.mother;
create trigger trg_mother_sms_number
  after update of contact_number on public.mother
  for each row
  when (new.contact_number is distinct from old.contact_number)
  execute function public.follow_mother_number();

-- 12. The schedule --------------------------------------------------------------------------
-- Calls the sender with the two Vault secrets. Missing either one: does
-- nothing. Returns pg_net's request id (null when nothing was called).

create or replace function public.call_sms_sender()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  sender_url text;
  cron_secret text;
begin
  select btrim(s.decrypted_secret) into sender_url
  from vault.decrypted_secrets as s
  where s.name = 'sms_sender_url'
  limit 1;

  select btrim(s.decrypted_secret) into cron_secret
  from vault.decrypted_secrets as s
  where s.name = 'cron_secret'
  limit 1;

  if coalesce(sender_url, '') = '' or coalesce(cron_secret, '') = '' then
    return null;
  end if;

  return net.http_post(
    url := sender_url,
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || cron_secret
    ),
    timeout_milliseconds := 30000
  );
end;
$$;

-- Only the scheduler and the SQL editor run it.
revoke execute on function public.call_sms_sender() from public, anon, authenticated;

-- Every 5 minutes, 00:00-11:55 UTC = 8:00 AM-7:55 PM Manila. Running this
-- file again replaces the job instead of adding a second one.
select cron.schedule(
  'send-sms',
  '*/5 0-11 * * *',
  $$select public.call_sms_sender();$$
);

-- Let the API see the new columns, table and functions right away.
notify pgrst, 'reload schema';
