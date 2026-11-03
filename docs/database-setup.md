# Database setup

Run these in **Supabase Dashboard → SQL Editor**, in order. Each file is safe to read before running. Only 0012–0013 delete records (the Laboratory Test service); 0009 and 0015 also remove unsent SMS messages that no longer apply.

| # | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/0001_role_helpers.sql` | INACTIVE accounts lose access; adds `current_mother_id()` and `current_health_worker_id()` |
| 2 | `supabase/migrations/0002_username_rules.sql` | Usernames: lowercase, 3–30 chars, letters/numbers/`.`/`_` |
| 3 | `supabase/migrations/0003_one_active_pregnancy.sql` | Only one ACTIVE pregnancy per mother |
| 4 | `supabase/migrations/0004_mother_signup.sql` | Website sign-up creates `user_account` + `mother` + `pregnancy` together; username availability check |
| 5 | `supabase/migrations/0005_mother_self_service.sql` | Mother can cancel her own REQUESTED appointment; protects `registered_by`, `user_id`, `registration_date` |
| 6 | `supabase/migrations/0006_login_attempt.sql` | Table for the 5-failures → 15-minute lock |
| 7 | `supabase/migrations/0007_phase2.sql` | Phase 2: usernames 8+ characters for new accounts and renames; renames the first admin login `admin` → `taysan.admin`; health workers may edit their own name and contact |
| 8 | `supabase/migrations/0008_phase3.sql` | Phase 3: admin-managed purok list (Purok 1–10 to start) and `mother.purok_id` (existing typed puroks matched where clear); sign-up saves the chosen purok; past pregnancies allowed (EDD only required while active, outcome date checked against the LMP) |
| 9 | `supabase/migrations/0009_phase4.sql` | Phase 4: closed days; appointment slot rules (30-minute weekday slots 8–12 and 1–3, Manila time, not closed, not past; mothers from tomorrow up to 3 months); one appointment per slot; mother cancel / accept / decline functions; `taken_slots()`; SMS reminder queue kept in step with each appointment |
| 10 | `supabase/migrations/0010_service_icons.sql` | Phase 4: an icon for each service (activity type), picked by admins from a fixed set; the 5 existing services get fitting icons |
| 11 | `supabase/migrations/0011_more_services.sql` | Phase 4: adds Nutrition Counseling, Prenatal Dental Checkup, Fetal Heartbeat Check and Birth Plan Counseling (1-day reminder, with pictures); skips any that exist |
| 12 | `supabase/migrations/0012_remove_laboratory_test.sql` | Phase 4: deletes the Laboratory Test service; stops without deleting if any appointment or visit uses it (it stopped: 1 test appointment) |
| 13 | `supabase/migrations/0013_delete_laboratory_test.sql` | Phase 4: deletes Laboratory Test with its appointments and their SMS reminders (refuses if a recorded visit used it) |
| 14 | `supabase/migrations/0014_phase5.sql` | Phase 5: typo limits on vital signs; visits need a current pregnancy, get their AOG worked out, complete their appointment; health workers edit a visit only on its day (admins any time); `record_visit()` / `update_visit()` save a visit with its services together |
| 15 | `supabase/migrations/0015_phase6.sql` | Phase 6: turns on pg_cron; a check every day at 6:00 PM (Manila) marks passed appointments Missed (or Completed when she had a visit that day) and queues the missed-visit SMS for 8:00 AM the next morning; closing a pregnancy cancels its open appointments; follow-up rules (result, "No more follow-up needed", same-day edits, staff-only reading); the follow-up list (`follow_up_item`) |
| 16 | `supabase/migrations/0016_phase7.sql` | Phase 7: turns on pg_net; SMS settings (Test / Live, starts in Test; the test number; phone and plan status), admins only; each text gets tries, next try, where it went, delivery and check times, a reason code, and the new status Skipped; staff can no longer add or change texts directly (`retry_sms()` for admins); `claim_due_sms()` for the server sender (sending hours, too-late texts Skipped, at most 20 per run); new wording ("sa health center", "-Brgy. Taysan Health Center") in plain characters, also for texts still waiting; waiting texts follow a changed mobile number; the `send-sms` job every 5 minutes, 8:00 AM–7:55 PM Manila |
| 17 | `supabase/migrations/0017_phase7_live.sql` | Phase 7 step 3: no test mode (texts always go to her number, inside sending hours; `sms_setting` keeps only the phone and plan status; the `sms_mode` type is removed); three new text types for staff answers to her request (confirmed, new time proposed, declined), with their too-late rules; a visit reminder due the same day as her Confirmed text is saved as Skipped |
| 18 | `supabase/migrations/0018_sms_any_time.sql` | Phase 7: no sending hours (a due text goes on the next run, day or night); a reminder due the same day as her Confirmed text is Skipped; the `send-sms` job every 5 minutes, all day |
| 19 | `supabase/migrations/0019_sms_log.sql` | Phase 7 step 4: the `sms_log_item` view (each text with her name, the service and the appointment; staff read all, a mother her own) for the SMS log and her record's SMS log tab, and an index for newest first. Changes no data |
| 20 | `supabase/migrations/0020_sms_layout.sql` | Phase 7: every text in three parts ("Hi {name}!", the message, "From: Brgy. Taysan Health Center") with blank lines between; `sms_plain()` keeps line breaks; the Declined text ends "Thank you!"; texts still waiting get the new layout too |
| 21 | `supabase/migrations/0021_sms_visit_changes.sql` | Phase 7: texts when staff (admins or health workers) move or cancel a visit: "New time proposed" when she must accept it in the app, new types Visit moved (no login, confirmed at once) and Visit cancelled; no cancel text when her pregnancy is closed or the visit time has passed. Changes no data |
| 22 | `supabase/migrations/0022_guard_mother_login.sql` | Phase 9 security fix: a mother record's login can be set only while it has none, and only to a MOTHER login no other record uses; after that nobody logged in can change or remove it (the sign-up trigger and the server's secret key are not affected). Changes no data |
| — | `supabase/seed/first-admin.sql` | First admin (follow the steps at the top of the file) |

## Rules

- Migrations are never edited after they've been run. Fixes go in a new numbered file.
- If a file fails, stop and send the error message. Don't run the next file.

## Daily missed check (pg_cron, from 0015)

The job **mark-missed-appointments** runs every day at 10:00 UTC (6:00 PM Manila).

- Run the check now, e.g. to test: `select public.mark_missed_appointments();` (returns how many appointments it changed)
- See the job: `select jobname, schedule, active from cron.job;`
- Its last runs: `select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;`

## SMS sender job (pg_cron + pg_net, from 0016)

The job **send-sms** runs every 5 minutes, all day (from 0018; 0016 ran it 8:00 AM–7:55 PM Manila only). It calls `public.call_sms_sender()`, which posts to the sender address with `Authorization: Bearer <cron_secret>`. **Until both Vault secrets exist it does nothing**, so no text is sent.

**Vault secrets (Phase 7 step 6; set 2026-11-01 for the Vercel address).** Run these in the SQL Editor with your own values in place of the placeholders. Never put the values in a file or a migration, and don't save the query as a snippet.

```sql
select vault.create_secret('https://<your-app>.vercel.app/api/cron/send-sms', 'sms_sender_url', 'Address the send-sms job calls');
select vault.create_secret('<the same value as CRON_SECRET in .env.local>', 'cron_secret', 'Bearer token for the send-sms job');
```

- Change the address later: `select vault.update_secret((select id from vault.secrets where name = 'sms_sender_url'), '<new address>');`
- Stop automatic sending (e.g. if the SMS phone or plan has a problem): `delete from vault.secrets where name = 'sms_sender_url';`
- See which names exist (no values): `select name, created_at, updated_at from vault.secrets order by name;`

**The job:**

- See it: `select jobname, schedule, active, command from cron.job order by jobname;`
- Its last runs: `select status, return_message, start_time from cron.job_run_details where command like '%call_sms_sender%' order by start_time desc limit 5;`
- The sender's answers (kept 6 hours): `select id, status_code, timed_out, error_msg, created from net._http_response order by created desc limit 5;`
- Call it once by hand: `select public.call_sms_sender();` (returns null while a secret is missing).
- **Don't run `claim_due_sms()` by hand:** it takes texts (counts a try and locks them for 10 minutes). To see what it would skip, use the last check query below.

## Phase 7 check queries (after running 0016)

```sql
-- 1. New columns and the Skipped status
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name in ('sms_reminder', 'sms_setting')
order by table_name, ordinal_position;

select unnest(enum_range(null::public.sms_delivery_status)) as status;

select * from public.sms_setting;

-- 2. Rules on sms_reminder and sms_setting
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('sms_reminder', 'sms_setting')
order by tablename, policyname;

select grantee, string_agg(privilege_type, ', ' order by privilege_type) as rights
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'sms_reminder'
  and grantee in ('anon', 'authenticated', 'service_role')
group by grantee
order by grantee;

-- 3. The functions and extensions
select p.proname, l.lanname as language, p.prosecdef as security_definer,
       has_function_privilege('authenticated', p.oid, 'execute') as app_users_can_run,
       has_function_privilege('service_role', p.oid, 'execute') as server_can_run
from pg_proc as p
join pg_language as l on l.oid = p.prolang
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('sms_plain', 'sms_skip_reason', 'retry_sms', 'claim_due_sms',
                    'sync_appointment_reminder', 'drop_closed_missed_notices',
                    'mark_missed_appointments', 'follow_mother_number',
                    'call_sms_sender', 'stamp_sms_setting')
order by p.proname;

select extname, extversion from pg_extension
where extname in ('pg_net', 'pg_cron', 'supabase_vault')
order by extname;

select public.sms_plain('Hi Ána! 9:00' || chr(160) || 'AM – “Señora”') as plain;

-- 4. The send-sms job
select jobname, schedule, active, command from cron.job order by jobname;

select public.call_sms_sender() as request_id;   -- null: no Vault address yet

-- 5. Waiting texts: the new wording, and what the sender would skip
select reminder_id, reminder_type, scheduled_at, length(message_text) as chars, message_text
from public.sms_reminder
where delivery_status = 'PENDING'
order by scheduled_at desc
limit 10;

select count(*) filter (where message_text like '%-Taysan MaternaCare') as old_wording,
       count(*) filter (where message_text like '%-Brgy. Taysan Health Center') as new_wording
from public.sms_reminder
where delivery_status = 'PENDING';

select reminder_id, reminder_type, scheduled_at, public.sms_skip_reason(reminder_id) as would_skip
from public.sms_reminder
where delivery_status = 'PENDING'
order by scheduled_at;
```

## Phase 7 step 3 check queries (after running 0017)

```sql
-- 1. The new text types, and sms_setting without test mode
select unnest(enum_range(null::public.reminder_type)) as reminder_type;

select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'sms_setting'
order by ordinal_position;

select exists (select 1 from pg_type where typname = 'sms_mode') as sms_mode_left,
       exists (select 1 from pg_proc where proname = 'stamp_sms_setting') as stamp_left;

select policyname, cmd from pg_policies
where schemaname = 'public' and tablename = 'sms_setting';

-- 2. The functions still run with the right rights
select p.proname, p.prosecdef as security_definer,
       has_function_privilege('authenticated', p.oid, 'execute') as app_users_can_run,
       has_function_privilege('service_role', p.oid, 'execute') as server_can_run
from pg_proc as p
where p.pronamespace = 'public'::regnamespace
  and p.proname in ('claim_due_sms', 'sms_skip_reason', 'sync_appointment_reminder')
order by p.proname;

-- 3. Waiting texts and what the sender would skip
select reminder_id, reminder_type, scheduled_at, public.sms_skip_reason(reminder_id) as would_skip
from public.sms_reminder
where delivery_status = 'PENDING'
order by scheduled_at;
```

## 0018 check query (after running it)

```sql
select 1 as n, 'send-sms schedule' as check_name,
       (select schedule from cron.job where jobname = 'send-sms') as result, '*/5 * * * *' as expected
union all
select 2, 'claim_due_sms has no hours',
       (select strpos(prosrc, '08:00') = 0 from pg_proc where proname = 'claim_due_sms')::text, 'true'
union all
select 3, 'sync uses today for the overlap',
       (select strpos(prosrc, 'answer_day') = 0 and strpos(prosrc, 'covered_by_answer') > 0
        from pg_proc where proname = 'sync_appointment_reminder')::text, 'true'
union all
select 4, 'claim_due_sms: app / server',
       has_function_privilege('authenticated', 'public.claim_due_sms()', 'execute')::text || ' / '
         || has_function_privilege('service_role', 'public.claim_due_sms()', 'execute')::text,
       'false / true'
order by n;
```

## 0019 check query (after running it)

```sql
select 1 as n, 'view exists, runs as the reader' as check_name,
       (select coalesce(array_to_string(reloptions, ','), '') from pg_class where relname = 'sms_log_item') as result,
       'security_invoker=true' as expected
union all
select 2, 'app users can read it',
       has_table_privilege('authenticated', 'public.sms_log_item', 'SELECT')::text, 'true'
union all
select 3, 'anon can read it',
       has_table_privilege('anon', 'public.sms_log_item', 'SELECT')::text, 'false'
union all
select 4, 'rows in the view = texts',
       ((select count(*) from public.sms_log_item) = (select count(*) from public.sms_reminder))::text, 'true'
union all
select 5, 'newest-first index',
       exists (select 1 from pg_indexes where indexname = 'sms_reminder_shown_at')::text, 'true'
order by n;
```

## 0020 check query (after running it)

```sql
select 1 as n, 'sms_plain keeps line breaks' as check_name,
       (public.sms_plain(E'Hi  Ana! \n\n\n  Paalala:  test.\r\n\nFrom: X ') = E'Hi Ana!\n\nPaalala: test.\n\nFrom: X')::text as result,
       'true' as expected
union all
select 2, 'reminder and answers use the new layout',
       (select strpos(prosrc, 'From: Brgy. Taysan Health Center') > 0 and strpos(prosrc, 'Thank you!') > 0
        from pg_proc where proname = 'sync_appointment_reminder')::text, 'true'
union all
select 3, 'missed notice uses the new layout',
       (select strpos(prosrc, 'From: Brgy. Taysan Health Center') > 0
        from pg_proc where proname = 'mark_missed_appointments')::text, 'true'
union all
select 4, 'waiting texts still in the old layout',
       (select count(*) from public.sms_reminder
        where delivery_status = 'PENDING' and message_text like '% -Brgy. Taysan Health Center')::text, '0'
union all
select 5, 'sms_plain: app can call it',
       has_function_privilege('authenticated', 'public.sms_plain(text)', 'execute')::text, 'false'
order by n;

-- The waiting texts as they will go out (line breaks show in the result cell)
select reminder_id, reminder_type, scheduled_at, length(message_text) as chars, message_text
from public.sms_reminder
where delivery_status = 'PENDING'
order by scheduled_at;
```

## 0021 check query (after running it)

```sql
select 1 as n, 'new text types' as check_name,
       (select count(*) from unnest(enum_range(null::public.reminder_type)) as v
        where v::text in ('VISIT_MOVED', 'VISIT_CANCELLED'))::text as result,
       '2' as expected
union all
select 2, 'queuing handles moves and cancels',
       (select strpos(prosrc, 'VISIT_MOVED') > 0 and strpos(prosrc, 'VISIT_CANCELLED') > 0
               and strpos(prosrc, 'From: Brgy. Taysan Health Center') > 0
        from pg_proc where proname = 'sync_appointment_reminder')::text, 'true'
union all
select 3, 'too-late rules know the new types',
       (select strpos(prosrc, 'VISIT_MOVED') > 0 from pg_proc where proname = 'sms_skip_reason')::text, 'true'
union all
select 4, 'app can call the queuing function',
       has_function_privilege('authenticated', 'public.sync_appointment_reminder()', 'execute')::text, 'false'
order by n;
```

## 0022 check query (after running it)

It acts as a logged-in staff member inside the check and undoes every change, so nothing is saved.

```sql
create temp table if not exists guard_0022 (n int, check_name text, result text, expected text);
truncate guard_0022;

do $$
declare
  staff_id uuid := (select user_id from public.user_account
                    where role in ('ADMIN', 'HEALTH_WORKER') and account_status = 'ACTIVE'
                    order by role = 'HEALTH_WORKER' desc limit 1);
  admin_id uuid := (select user_id from public.user_account where role = 'ADMIN' limit 1);
  linked bigint := (select mother_id from public.mother where user_id is not null limit 1);
  unlinked bigint := (select mother_id from public.mother where user_id is null limit 1);
  changed int;
  r1 text; r2 text; r3 text; r4 text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', staff_id, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  -- 1. Point a record that has a login at the admin's login.
  begin
    update public.mother set user_id = admin_id where mother_id = linked;
    get diagnostics changed = row_count;
    r1 := case when linked is null then 'skipped: no mother with a login' when changed = 0 then 'no row changed' else 'ALLOWED' end;
    raise exception 'undo';
  exception when others then r1 := coalesce(r1, sqlerrm);
  end;

  -- 2. Give a record without a login the admin's login.
  begin
    update public.mother set user_id = admin_id where mother_id = unlinked;
    get diagnostics changed = row_count;
    r2 := case when unlinked is null then 'skipped: no mother without a login' when changed = 0 then 'no row changed' else 'ALLOWED' end;
    raise exception 'undo';
  exception when others then r2 := coalesce(r2, sqlerrm);
  end;

  -- 3. Remove a record's login.
  begin
    update public.mother set user_id = null where mother_id = linked;
    get diagnostics changed = row_count;
    r3 := case when linked is null then 'skipped: no mother with a login' when changed = 0 then 'no row changed' else 'ALLOWED' end;
    raise exception 'undo';
  exception when others then r3 := coalesce(r3, sqlerrm);
  end;

  -- 4. An ordinary edit of her details still works.
  begin
    update public.mother set first_name = first_name where mother_id = coalesce(linked, unlinked);
    get diagnostics changed = row_count;
    r4 := case when changed = 0 then 'no row changed' else 'ALLOWED' end;
    raise exception 'undo';
  exception when others then r4 := coalesce(r4, sqlerrm);
  end;

  execute 'reset role';
  insert into guard_0022 values
    (1, 'trigger installed',
        (select count(*) from pg_trigger where tgrelid = 'public.mother'::regclass
           and tgname = 'trg_mother_guard_login_link' and tgenabled = 'O')::text, '1'),
    (2, 'staff re-link a login to the admin', r1, 'login_link_locked'),
    (3, 'staff give a record the admin login', r2, 'login_link_invalid'),
    (4, 'staff remove a record''s login', r3, 'login_link_locked'),
    (5, 'staff edit her details', r4, 'ALLOWED');
end $$;

select * from guard_0022 order by n;
```

## Environment variables (`.env.local`, never committed)

| Name | Used for | Phase |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | 0 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser/server client (RLS applies) | 0 |
| `SUPABASE_SECRET_KEY` | Server-only admin client: username login, staff accounts, password resets | 0 |
| `HTTPSMS_API_KEY`, `HTTPSMS_FROM_NUMBER` | Sending texts through HTTPSMS (the from number as `+639…`) | 7 |
| `CRON_SECRET` | The `send-sms` job's Bearer token (the same value is in Vault as `cron_secret`) | 7 |
| `HTTPSMS_WEBHOOK_SIGNING_KEY` | Checks the token on HTTPSMS delivery updates (`/api/webhooks/httpsms`); also typed into HTTPSMS → Settings → Webhooks | 7 |

On Vercel, add the same values under Project Settings → Environment Variables.
