-- supabase/tests/rls-by-role.sql  (Phase 9 step 3: access rules per role;
-- Phase 10 step 4: notifications)
-- Run in the Supabase SQL editor whenever you want; it is NOT a migration.
-- Nothing is saved: every change it makes is undone before it finishes, and
-- no text message can go out (texts are only sent by the server, and the
-- queued ones are undone too). The made-up records also make notifications
-- (for example "a mother signed up" for every staff member); those are undone
-- too, so no one ever sees them.
--
-- What it does:
-- 1. Makes made-up logins and records (an admin, a health worker, an inactive
--    health worker, a mother with a login and a mother without one, each
--    mother with a current pregnancy and a confirmed visit 6+ weeks away;
--    the first mother also has a recorded visit, and a missed visit from
--    yesterday with a follow-up logged today). Each login also gets a
--    notification of its own.
--    The database refuses visits in the past, so that check is switched off
--    for the one missed visit and straight back on; this is undone with the
--    rest, so the check is never off outside this run.
-- 2. Acts as each one (and as a logged-out visitor) the way the website's
--    database connection does, tries reads and changes, and compares what
--    happens with the rules in docs/PLAN.md.
-- 3. Undoes everything and lists the results: PASS, FAIL, SKIP (nothing to
--    test against) or INFO (shown for you to judge, no fixed rule).
--
-- Reading the result column: "rows: N" (rows it could see), "rows: N of M"
-- (M = all rows that exist), "changed: N" (rows a change touched; 0 means the
-- access rules silently hid them), "ok" (a function call worked), "rows
-- after: N" (what a function call left behind, counted as the script's owner),
-- or "error: …" (refused).

create temp table if not exists rls_results (
  n int, actor text, check_name text, result text, expected text, verdict text
);
truncate rls_results;

-- One test: who acts, what is checked, how ('count' a select, 'write' a
-- change, 'call' a function), the SQL, and what should happen:
--   none        sees nothing (0 rows or refused)
--   all         sees every row that exists
--   eq:N        sees exactly N rows
--   same:<sql>  sees as many rows as <sql> finds for the script's owner
--   allowed     works (a change touches at least one row)
--   blocked     refused, or the change touches no row
--   error:<x>   refused with an error mentioning <x>
--   after:N:<sql>  works, and afterwards <sql> finds N rows (counted as the
--               script's owner, so what the access rules hide still counts)
--   info        just shown
create or replace function pg_temp.rls_case(p_actor text, p_name text, p_kind text, p_sql text, p_expect text)
returns jsonb
language sql
as $$
  select jsonb_build_array(jsonb_build_object('actor', p_actor, 'name', p_name, 'kind', p_kind, 'sql', p_sql, 'expect', p_expect));
$$;

do $$
declare
  zero constant uuid := '00000000-0000-0000-0000-000000000000';
  u_admin uuid := gen_random_uuid();
  u_hw uuid := gen_random_uuid();
  u_hw_off uuid := gen_random_uuid();
  u_m1 uuid := gen_random_uuid();
  hw_admin bigint; hw_id bigint; hw_off_id bigint;
  m1 bigint; m2 bigint; p1 bigint; p2 bigint; a1 bigint; a2 bigint; a3 bigint; v1 bigint;
  n_m1 bigint; n_hw bigint;
  svc bigint; purok bigint;
  slots timestamptz[];
  free_day date;
  tests jsonb := '[]';
  t jsonb;
  results jsonb := '[]';
  actor_id uuid;
  got_rows bigint; ref_rows bigint; failed text; result text; verdict text; expect text;
  i int := 0;
begin
  begin
    ----------------------------------------------------------------------------------------
    -- 1. Made-up logins and records (as the script's owner, so no access rules apply)
    ----------------------------------------------------------------------------------------
    select activity_type_id into svc from public.activity_type order by activity_type_id limit 1;
    select purok_id into purok from public.purok order by purok_id limit 1;

    -- Four free half-hour slots 6+ weeks away (weekday, open, not taken).
    select array_agg(ts order by ts) into slots from (
      select c.ts
      from (
        select ((current_date + d) + tm) at time zone 'Asia/Manila' as ts
        from generate_series(45, 80) as d,
             unnest(array['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30']::time[]) as tm
      ) as c
      where extract(isodow from c.ts at time zone 'Asia/Manila') <= 5
        and not exists (select 1 from public.closed_day as cd where cd.closed_date = (c.ts at time zone 'Asia/Manila')::date)
        and not exists (select 1 from public.appointment as a
                        where coalesce(a.scheduled_datetime, a.requested_datetime) = c.ts and a.status <> 'CANCELLED')
      order by c.ts
      limit 4
    ) as free;

    -- A future weekday that isn't a closed day (for the admin's closed-day test).
    select d::date into free_day
    from generate_series(current_date + 300, current_date + 330, interval '1 day') as d
    where extract(isodow from d) <= 5
      and not exists (select 1 from public.closed_day where closed_date = d::date)
    limit 1;

    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    select zero, u, 'authenticated', 'authenticated', e || '@no-email.taysan-maternacare.invalid', '',
           now(), '{}'::jsonb, '{}'::jsonb, now(), now()
    from (values (u_admin, 'rlstest.admin'), (u_hw, 'rlstest.worker'), (u_hw_off, 'rlstest.inactive'),
                 (u_m1, 'rlstest.mother')) as v(u, e);

    insert into public.user_account (user_id, username, role, account_status) values
      (u_admin, 'rlstest.admin', 'ADMIN', 'ACTIVE'),
      (u_hw, 'rlstest.worker', 'HEALTH_WORKER', 'ACTIVE'),
      (u_hw_off, 'rlstest.inactive', 'HEALTH_WORKER', 'INACTIVE'),
      (u_m1, 'rlstest.mother', 'MOTHER', 'ACTIVE');

    insert into public.health_worker (user_id, first_name, last_name, position, contact_number)
    values (u_admin, 'Test', 'Admin', 'Admin staff', '09170000001') returning health_worker_id into hw_admin;
    insert into public.health_worker (user_id, first_name, last_name, position, contact_number)
    values (u_hw, 'Test', 'Worker', 'Midwife', '09170000002') returning health_worker_id into hw_id;
    insert into public.health_worker (user_id, first_name, last_name, position, contact_number)
    values (u_hw_off, 'Test', 'Inactive', 'Midwife', '09170000003') returning health_worker_id into hw_off_id;

    insert into public.mother (user_id, first_name, last_name, date_of_birth, contact_number, purok_id,
                               street_address, emergency_contact_name, emergency_contact_no, registration_date)
    values (u_m1, 'Test', 'MotherOne', '1998-01-01', '09170000011', purok, 'Test street', 'Test Contact', '09170000012', current_date)
    returning mother_id into m1;
    insert into public.mother (user_id, first_name, last_name, date_of_birth, contact_number, purok_id,
                               street_address, emergency_contact_name, emergency_contact_no, registration_date)
    values (null, 'Test', 'MotherTwo', '1997-02-02', '09170000021', purok, 'Test street', 'Test Contact', '09170000022', current_date)
    returning mother_id into m2;

    insert into public.pregnancy (mother_id, gravida, para, lmp_date, expected_delivery_date, pregnancy_status, registration_date)
    values (m1, 1, 0, current_date - 100, current_date + 180, 'ACTIVE', current_date) returning pregnancy_id into p1;
    insert into public.pregnancy (mother_id, gravida, para, lmp_date, expected_delivery_date, pregnancy_status, registration_date)
    values (m2, 2, 1, current_date - 120, current_date + 160, 'ACTIVE', current_date) returning pregnancy_id into p2;

    insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, reviewed_by,
                                    requested_datetime, scheduled_datetime, status)
    values (p1, svc, u_hw, hw_id, slots[1], slots[1], 'CONFIRMED') returning appointment_id into a1;
    insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, reviewed_by,
                                    requested_datetime, scheduled_datetime, status)
    values (p2, svc, u_hw, hw_id, slots[2], slots[2], 'CONFIRMED') returning appointment_id into a2;

    insert into public.prenatal_visit (pregnancy_id, health_worker_id, appointment_id, visit_datetime, aog_weeks,
                                       bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse_rate)
    values (p1, hw_id, null, now(), 0, 110, 70, 60, 36.5, 80) returning visit_id into v1;
    insert into public.visit_service (visit_id, activity_type_id, dose_or_details) values (v1, svc, 'Test');

    -- A missed visit yesterday at 3:10 AM (never a real slot) and a follow-up today.
    alter table public.appointment disable trigger trg_appointment_check_slot;
    insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, reviewed_by,
                                    requested_datetime, scheduled_datetime, status)
    values (p1, svc, u_hw, hw_id,
            (current_date - 1 + time '03:10') at time zone 'Asia/Manila',
            (current_date - 1 + time '03:10') at time zone 'Asia/Manila', 'MISSED')
    returning appointment_id into a3;
    alter table public.appointment enable trigger trg_appointment_check_slot;
    insert into public.follow_up (appointment_id, health_worker_id, follow_up_date, method, outcome_notes, result)
    values (a3, hw_id, (now() at time zone 'Asia/Manila')::date, 'CALL', 'RLS test', 'REACHED');

    -- One unread notification each (the records above already made some:
    -- the staff got her sign-up notice, she got her checkup notice).
    perform public.add_notification(u_m1, 'VISIT_REMINDER', jsonb_build_object('service', 'Test'), a1, m1);
    perform public.add_notification(u_hw, 'NEW_REQUEST', jsonb_build_object('mother_name', 'Test MotherOne'), a1, m1);
    perform public.add_notification(u_admin, 'SMS_FAILED', jsonb_build_object('count', 1));
    perform public.add_notification(u_hw_off, 'NEW_REQUEST', jsonb_build_object('mother_name', 'Test MotherOne'), a1, m1);
    select max(notification_id) into n_m1 from public.notification where user_id = u_m1;
    select max(notification_id) into n_hw from public.notification where user_id = u_hw;

    ----------------------------------------------------------------------------------------
    -- 2. The tests
    ----------------------------------------------------------------------------------------

    -- Logged-out visitor
    tests := tests
      || pg_temp.rls_case('visitor', 'Login accounts', 'count', 'select 1 from public.user_account', 'none')
      || pg_temp.rls_case('visitor', 'Mothers', 'count', 'select 1 from public.mother', 'none')
      || pg_temp.rls_case('visitor', 'Pregnancies', 'count', 'select 1 from public.pregnancy', 'none')
      || pg_temp.rls_case('visitor', 'Appointments', 'count', 'select 1 from public.appointment', 'none')
      || pg_temp.rls_case('visitor', 'Visits', 'count', 'select 1 from public.prenatal_visit', 'none')
      || pg_temp.rls_case('visitor', 'Services given', 'count', 'select 1 from public.visit_service', 'none')
      || pg_temp.rls_case('visitor', 'Follow-ups', 'count', 'select 1 from public.follow_up', 'none')
      || pg_temp.rls_case('visitor', 'Text messages', 'count', 'select 1 from public.sms_reminder', 'none')
      || pg_temp.rls_case('visitor', 'Staff profiles', 'count', 'select 1 from public.health_worker', 'none')
      || pg_temp.rls_case('visitor', 'SMS phone status', 'count', 'select 1 from public.sms_setting', 'none')
      || pg_temp.rls_case('visitor', 'Login lock log', 'count', 'select 1 from public.login_attempt', 'none')
      || pg_temp.rls_case('visitor', 'Abuse-limit log', 'count', 'select 1 from public.rate_limit_hit', 'none')
      || pg_temp.rls_case('visitor', 'Shown puroks (sign-up list)', 'count', 'select 1 from public.purok where is_active', 'all')
      || pg_temp.rls_case('visitor', 'Services list', 'count', 'select 1 from public.activity_type', 'info')
      || pg_temp.rls_case('visitor', 'Closed days', 'count', 'select 1 from public.closed_day', 'info')
      || pg_temp.rls_case('visitor', 'Add an appointment', 'write',
           format('insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, requested_datetime, status) values (%s, %s, %L, %L, ''REQUESTED'')', p1, svc, u_m1, slots[3]), 'blocked')
      || pg_temp.rls_case('visitor', 'Username check (sign-up)', 'call', 'public.is_username_available(''zz.nobody.here'')', 'allowed')
      || pg_temp.rls_case('visitor', 'Cancel an appointment', 'call', format('public.cancel_my_appointment(%s)', a1), 'blocked');

    -- Mother (with a login)
    tests := tests
      || pg_temp.rls_case('mother', 'Her own record', 'count', format('select 1 from public.mother where mother_id = %s', m1), 'eq:1')
      || pg_temp.rls_case('mother', 'Another mother''s record', 'count', format('select 1 from public.mother where mother_id = %s', m2), 'eq:0')
      || pg_temp.rls_case('mother', 'All mother records (only hers)', 'count', 'select 1 from public.mother', 'eq:1')
      || pg_temp.rls_case('mother', 'Her login account only', 'count', 'select 1 from public.user_account', 'eq:1')
      || pg_temp.rls_case('mother', 'Pregnancies (only hers)', 'count', 'select 1 from public.pregnancy', 'eq:1')
      || pg_temp.rls_case('mother', 'Appointments (only her 2)', 'count', 'select 1 from public.appointment', 'eq:2')
      || pg_temp.rls_case('mother', 'Visits (only hers)', 'count', 'select 1 from public.prenatal_visit', 'eq:1')
      || pg_temp.rls_case('mother', 'Services given (only hers)', 'count', 'select 1 from public.visit_service', 'eq:1')
      || pg_temp.rls_case('mother', 'Text messages (only hers)', 'count', 'select 1 from public.sms_reminder',
           format('same:select 1 from public.sms_reminder where appointment_id in (%s, %s)', a1, a3))
      || pg_temp.rls_case('mother', 'SMS log view (only hers)', 'count', 'select 1 from public.sms_log_item',
           format('same:select 1 from public.sms_reminder where appointment_id in (%s, %s)', a1, a3))
      || pg_temp.rls_case('mother', 'Follow-ups, even on her own missed visit (staff only)', 'count', 'select 1 from public.follow_up', 'none')
      -- The view follows her own rules: her own missed visit shows (staff pages
      -- only read it), but the follow-up details come from a table she can't read.
      || pg_temp.rls_case('mother', 'Follow-up list view: only her own missed visit', 'count', 'select 1 from public.follow_up_item', 'eq:1')
      || pg_temp.rls_case('mother', 'Follow-up list view: no staff follow-up details', 'count',
           'select 1 from public.follow_up_item where attempts > 0 or last_follow_up_date is not null or last_method is not null or last_result is not null or close_reason is not null', 'none')
      || pg_temp.rls_case('mother', 'SMS phone status', 'count', 'select 1 from public.sms_setting', 'none')
      || pg_temp.rls_case('mother', 'Login lock log', 'count', 'select 1 from public.login_attempt', 'none')
      || pg_temp.rls_case('mother', 'Abuse-limit log', 'count', 'select 1 from public.rate_limit_hit', 'none')
      || pg_temp.rls_case('mother', 'Staff profiles', 'count', 'select 1 from public.health_worker', 'info')
      || pg_temp.rls_case('mother', 'Services list', 'count', 'select 1 from public.activity_type', 'all')
      || pg_temp.rls_case('mother', 'Edit her own name', 'write',
           format('update public.mother set first_name = first_name where mother_id = %s', m1), 'allowed')
      || pg_temp.rls_case('mother', 'Edit another mother''s name', 'write',
           format('update public.mother set first_name = first_name where mother_id = %s', m2), 'blocked')
      || pg_temp.rls_case('mother', 'Change who registered her', 'write',
           format('update public.mother set registered_by = %s where mother_id = %s', hw_id, m1), 'blocked')
      || pg_temp.rls_case('mother', 'Change her record''s login', 'write',
           format('update public.mother set user_id = null where mother_id = %s', m1), 'blocked')
      || pg_temp.rls_case('mother', 'Make herself an admin', 'write',
           format('update public.user_account set role = ''ADMIN'' where user_id = %L', u_m1), 'blocked')
      || pg_temp.rls_case('mother', 'Change her account status', 'write',
           format('update public.user_account set account_status = ''INACTIVE'' where user_id = %L', u_m1), 'blocked')
      || pg_temp.rls_case('mother', 'Give herself a staff profile', 'write',
           format('insert into public.health_worker (user_id, first_name, last_name, position, contact_number) values (%L, ''X'', ''Y'', ''Midwife'', ''09170000099'')', u_m1), 'blocked')
      || pg_temp.rls_case('mother', 'Request a visit for herself', 'write',
           format('insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, requested_datetime, status) values (%s, %s, %L, %L, ''REQUESTED'')', p1, svc, u_m1, slots[3]), 'allowed')
      || pg_temp.rls_case('mother', 'Request a visit for another mother', 'write',
           format('insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, requested_datetime, status) values (%s, %s, %L, %L, ''REQUESTED'')', p2, svc, u_m1, slots[3]), 'blocked')
      || pg_temp.rls_case('mother', 'Confirm or change her visit directly', 'write',
           format('update public.appointment set remarks = ''x'' where appointment_id = %s', a1), 'blocked')
      || pg_temp.rls_case('mother', 'Change another mother''s visit', 'write',
           format('update public.appointment set remarks = ''x'' where appointment_id = %s', a2), 'blocked')
      || pg_temp.rls_case('mother', 'Delete her visit', 'write',
           format('delete from public.appointment where appointment_id = %s', a1), 'blocked')
      || pg_temp.rls_case('mother', 'Cancel her own visit (function)', 'call', format('public.cancel_my_appointment(%s)', a1), 'allowed')
      || pg_temp.rls_case('mother', 'Cancel another mother''s visit', 'call', format('public.cancel_my_appointment(%s)', a2), 'blocked')
      || pg_temp.rls_case('mother', 'Change her pregnancy', 'write',
           format('update public.pregnancy set expected_delivery_date = expected_delivery_date where pregnancy_id = %s', p1), 'blocked')
      || pg_temp.rls_case('mother', 'Add a visit record', 'write',
           format('insert into public.prenatal_visit (pregnancy_id, health_worker_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse_rate) values (%s, %s, now(), 0, 110, 70, 60, 36.5, 80)', p1, hw_id), 'blocked')
      || pg_temp.rls_case('mother', 'Record a visit (function)', 'call',
           format('public.record_visit(%s, null, 110, 70, 60, 36.5, 80, null, null, null, ''[]''::jsonb)', p1), 'blocked')
      || pg_temp.rls_case('mother', 'Change her visit record', 'write',
           format('update public.prenatal_visit set notes = ''x'' where visit_id = %s', v1), 'blocked')
      || pg_temp.rls_case('mother', 'Add a text message', 'write',
           format('insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status) values (%s, ''UPCOMING'', ''09170000000'', ''x'', now(), ''PENDING'')', a1), 'blocked')
      || pg_temp.rls_case('mother', 'Change a text message', 'write',
           format('update public.sms_reminder set recipient_number = ''09170000000'' where appointment_id = %s', a1), 'blocked')
      || pg_temp.rls_case('mother', 'Retry a text (admins only)', 'call', 'public.retry_sms(1)', 'error:not_allowed')
      || pg_temp.rls_case('mother', 'Add a closed day', 'write',
           format('insert into public.closed_day (closed_date, reason) values (%L, ''x'')', free_day), 'blocked')
      || pg_temp.rls_case('mother', 'Change a service', 'write',
           format('update public.activity_type set description = description where activity_type_id = %s', svc), 'blocked')
      || pg_temp.rls_case('mother', 'Change a purok', 'write',
           format('update public.purok set name = name where purok_id = %s', purok), 'blocked')
      || pg_temp.rls_case('mother', 'Her open missed visits (function)', 'call', 'public.my_open_missed_visits()', 'allowed')
      || pg_temp.rls_case('mother', 'Taken times (function)', 'call', 'public.taken_slots(current_date, current_date + 30)', 'allowed');

    -- Health worker
    tests := tests
      || pg_temp.rls_case('health worker', 'Mothers', 'count', 'select 1 from public.mother', 'all')
      || pg_temp.rls_case('health worker', 'Pregnancies', 'count', 'select 1 from public.pregnancy', 'all')
      || pg_temp.rls_case('health worker', 'Appointments', 'count', 'select 1 from public.appointment', 'all')
      || pg_temp.rls_case('health worker', 'Visits', 'count', 'select 1 from public.prenatal_visit', 'all')
      || pg_temp.rls_case('health worker', 'Services given', 'count', 'select 1 from public.visit_service', 'all')
      || pg_temp.rls_case('health worker', 'Follow-ups', 'count', 'select 1 from public.follow_up', 'all')
      || pg_temp.rls_case('health worker', 'Follow-up list view', 'count', 'select 1 from public.follow_up_item', 'all')
      || pg_temp.rls_case('health worker', 'Follow-up list view: sees the follow-up details', 'count',
           format('select 1 from public.follow_up_item where appointment_id = %s and attempts = 1 and last_method = ''CALL''', a3), 'eq:1')
      || pg_temp.rls_case('health worker', 'Text messages', 'count', 'select 1 from public.sms_reminder', 'all')
      || pg_temp.rls_case('health worker', 'SMS log view', 'count', 'select 1 from public.sms_log_item', 'all')
      || pg_temp.rls_case('health worker', 'Staff profiles', 'count', 'select 1 from public.health_worker', 'all')
      || pg_temp.rls_case('health worker', 'Login accounts', 'count', 'select 1 from public.user_account', 'info')
      || pg_temp.rls_case('health worker', 'SMS phone status (admins only)', 'count', 'select 1 from public.sms_setting', 'none')
      || pg_temp.rls_case('health worker', 'Login lock log', 'count', 'select 1 from public.login_attempt', 'none')
      || pg_temp.rls_case('health worker', 'Abuse-limit log', 'count', 'select 1 from public.rate_limit_hit', 'none')
      || pg_temp.rls_case('health worker', 'Edit a mother', 'write',
           format('update public.mother set street_address = street_address where mother_id = %s', m2), 'allowed')
      || pg_temp.rls_case('health worker', 'Delete a mother', 'write',
           format('delete from public.mother where mother_id = %s', m2), 'blocked')
      || pg_temp.rls_case('health worker', 'Link a staff login to a mother', 'write',
           format('update public.mother set user_id = %L where mother_id = %s', u_admin, m2), 'blocked')
      || pg_temp.rls_case('health worker', 'Make herself an admin', 'write',
           format('update public.user_account set role = ''ADMIN'' where user_id = %L', u_hw), 'blocked')
      || pg_temp.rls_case('health worker', 'Change a mother''s login status directly', 'write',
           format('update public.user_account set account_status = ''INACTIVE'' where user_id = %L', u_m1), 'blocked')
      || pg_temp.rls_case('health worker', 'Add a login account', 'write',
           format('insert into public.user_account (user_id, username, role, account_status) values (%L, ''rlstest.sneaky'', ''ADMIN'', ''ACTIVE'')', u_m1), 'blocked')
      || pg_temp.rls_case('health worker', 'Edit her own name', 'write',
           format('update public.health_worker set first_name = first_name where health_worker_id = %s', hw_id), 'allowed')
      || pg_temp.rls_case('health worker', 'Change her own position (admins only)', 'write',
           format('update public.health_worker set position = ''Nurse'' where health_worker_id = %s', hw_id), 'blocked')
      || pg_temp.rls_case('health worker', 'Edit another staff member', 'write',
           format('update public.health_worker set first_name = first_name where health_worker_id = %s', hw_admin), 'blocked')
      || pg_temp.rls_case('health worker', 'Book a visit for a mother', 'write',
           format('insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, reviewed_by, requested_datetime, scheduled_datetime, status) values (%s, %s, %L, %s, %L, %L, ''CONFIRMED'')', p2, svc, u_hw, hw_id, slots[4], slots[4]), 'allowed')
      || pg_temp.rls_case('health worker', 'Delete an appointment', 'write',
           format('delete from public.appointment where appointment_id = %s', a2), 'blocked')
      || pg_temp.rls_case('health worker', 'Edit today''s visit record', 'write',
           format('update public.prenatal_visit set notes = ''x'' where visit_id = %s', v1), 'allowed')
      || pg_temp.rls_case('health worker', 'Delete follow-ups (admins only)', 'write', 'delete from public.follow_up', 'blocked')
      || pg_temp.rls_case('health worker', 'Add a text message', 'write',
           format('insert into public.sms_reminder (appointment_id, reminder_type, recipient_number, message_text, scheduled_at, delivery_status) values (%s, ''UPCOMING'', ''09170000000'', ''x'', now(), ''PENDING'')', a1), 'blocked')
      || pg_temp.rls_case('health worker', 'Change a text message', 'write',
           format('update public.sms_reminder set recipient_number = ''09170000000'' where appointment_id = %s', a1), 'blocked')
      || pg_temp.rls_case('health worker', 'Delete text messages', 'write', 'delete from public.sms_reminder', 'blocked')
      || pg_temp.rls_case('health worker', 'Change the SMS phone status', 'write', 'update public.sms_setting set phone_online = phone_online', 'blocked')
      || pg_temp.rls_case('health worker', 'Retry a text (admins only)', 'call', 'public.retry_sms(1)', 'error:not_allowed')
      || pg_temp.rls_case('health worker', 'Take texts to send (server only)', 'call', 'public.claim_due_sms()', 'blocked')
      || pg_temp.rls_case('health worker', 'Run the missed check (server only)', 'call', 'public.mark_missed_appointments()', 'blocked')
      || pg_temp.rls_case('health worker', 'Add a closed day (admins only)', 'write',
           format('insert into public.closed_day (closed_date, reason) values (%L, ''x'')', free_day), 'blocked')
      || pg_temp.rls_case('health worker', 'Change a service (admins only)', 'write',
           format('update public.activity_type set description = description where activity_type_id = %s', svc), 'blocked')
      || pg_temp.rls_case('health worker', 'Add a service (admins only)', 'write',
           'insert into public.activity_type (name, reminder_days_before) values (''RLS test service'', 1)', 'blocked')
      || pg_temp.rls_case('health worker', 'Change a purok (admins only)', 'write',
           format('update public.purok set name = name where purok_id = %s', purok), 'blocked');

    -- Inactive health worker (treated as logged out)
    tests := tests
      || pg_temp.rls_case('inactive worker', 'Mothers', 'count', 'select 1 from public.mother', 'none')
      || pg_temp.rls_case('inactive worker', 'Appointments', 'count', 'select 1 from public.appointment', 'none')
      || pg_temp.rls_case('inactive worker', 'Follow-ups', 'count', 'select 1 from public.follow_up', 'none')
      || pg_temp.rls_case('inactive worker', 'Edit a mother', 'write',
           format('update public.mother set street_address = street_address where mother_id = %s', m2), 'blocked')
      || pg_temp.rls_case('inactive worker', 'Book a visit', 'write',
           format('insert into public.appointment (pregnancy_id, activity_type_id, requested_by_user_id, requested_datetime, scheduled_datetime, status) values (%s, %s, %L, %L, %L, ''CONFIRMED'')', p2, svc, u_hw_off, slots[4], slots[4]), 'blocked');

    -- Admin
    tests := tests
      || pg_temp.rls_case('admin', 'Login accounts', 'count', 'select 1 from public.user_account', 'all')
      || pg_temp.rls_case('admin', 'Mothers', 'count', 'select 1 from public.mother', 'all')
      || pg_temp.rls_case('admin', 'SMS phone status', 'count', 'select 1 from public.sms_setting', 'all')
      || pg_temp.rls_case('admin', 'Login lock log (server only)', 'count', 'select 1 from public.login_attempt', 'none')
      || pg_temp.rls_case('admin', 'Abuse-limit log (server only)', 'count', 'select 1 from public.rate_limit_hit', 'none')
      || pg_temp.rls_case('admin', 'Deactivate a staff login', 'write',
           format('update public.user_account set account_status = ''INACTIVE'' where user_id = %L', u_hw), 'allowed')
      || pg_temp.rls_case('admin', 'Change a staff position', 'write',
           format('update public.health_worker set position = ''Nurse'' where health_worker_id = %s', hw_id), 'allowed')
      || pg_temp.rls_case('admin', 'Add a closed day', 'write',
           format('insert into public.closed_day (closed_date, reason) values (%L, ''RLS test'')', free_day), 'allowed')
      || pg_temp.rls_case('admin', 'Change a service', 'write',
           format('update public.activity_type set description = description where activity_type_id = %s', svc), 'allowed')
      || pg_temp.rls_case('admin', 'Change a purok', 'write',
           format('update public.purok set name = name where purok_id = %s', purok), 'allowed')
      || pg_temp.rls_case('admin', 'Delete a follow-up', 'write',
           'delete from public.follow_up where follow_up_id = (select max(follow_up_id) from public.follow_up)', 'allowed')
      || pg_temp.rls_case('admin', 'Change a text message directly', 'write',
           format('update public.sms_reminder set recipient_number = ''09170000000'' where appointment_id = %s', a1), 'blocked')
      || pg_temp.rls_case('admin', 'Take texts to send (server only)', 'call', 'public.claim_due_sms()', 'blocked');

    -- Notifications (Phase 10): each person sees and marks only their own; no
    -- one adds, changes or deletes them directly (the database makes them).
    -- "now()" is when this run started, so "read_at = now()" means "marked
    -- read during this test".
    tests := tests
      || pg_temp.rls_case('visitor', 'Notifications', 'count', 'select 1 from public.notification', 'none')
      || pg_temp.rls_case('visitor', 'Mark all notifications read', 'call', 'public.mark_all_notifications_read()', 'blocked')
      || pg_temp.rls_case('visitor', 'Mark a notification read', 'call', format('public.mark_notification_read(%s)', n_m1), 'blocked')

      || pg_temp.rls_case('mother', 'Notifications (only her own)', 'count', 'select 1 from public.notification',
           format('same:select 1 from public.notification where user_id = %L', u_m1))
      || pg_temp.rls_case('mother', 'A health worker''s notifications', 'count',
           format('select 1 from public.notification where user_id = %L', u_hw), 'none')
      || pg_temp.rls_case('mother', 'Add a notification', 'write',
           format('insert into public.notification (user_id, notification_type) values (%L, ''VISIT_BOOKED'')', u_m1), 'blocked')
      || pg_temp.rls_case('mother', 'Mark her notification read directly', 'write',
           format('update public.notification set read_at = now() where notification_id = %s', n_m1), 'blocked')
      || pg_temp.rls_case('mother', 'Delete her notifications', 'write', 'delete from public.notification', 'blocked')
      || pg_temp.rls_case('mother', 'Mark her own notification read (function)', 'call', format('public.mark_notification_read(%s)', n_m1),
           format('after:1:select 1 from public.notification where notification_id = %s and read_at = now()', n_m1))
      || pg_temp.rls_case('mother', 'Mark a health worker''s notification read', 'call', format('public.mark_notification_read(%s)', n_hw),
           format('after:0:select 1 from public.notification where notification_id = %s and read_at is not null', n_hw))
      || pg_temp.rls_case('mother', 'Mark all read: every one of hers', 'call', 'public.mark_all_notifications_read()',
           format('after:0:select 1 from public.notification where user_id = %L and read_at is null', u_m1))
      || pg_temp.rls_case('mother', 'Mark all read: no one else''s', 'call', 'public.mark_all_notifications_read()',
           format('after:0:select 1 from public.notification where user_id <> %L and read_at = now()', u_m1))
      || pg_temp.rls_case('mother', 'Add a notification (database only)', 'call',
           format('public.add_notification(%L, ''VISIT_BOOKED'')', u_m1), 'blocked')

      || pg_temp.rls_case('health worker', 'Notifications (only her own)', 'count', 'select 1 from public.notification',
           format('same:select 1 from public.notification where user_id = %L', u_hw))
      || pg_temp.rls_case('health worker', 'A mother''s notifications', 'count',
           format('select 1 from public.notification where user_id = %L', u_m1), 'none')
      || pg_temp.rls_case('health worker', 'Mark her notification read directly', 'write',
           format('update public.notification set read_at = now() where notification_id = %s', n_hw), 'blocked')
      || pg_temp.rls_case('health worker', 'Mark a mother''s notification read', 'call', format('public.mark_notification_read(%s)', n_m1),
           format('after:0:select 1 from public.notification where notification_id = %s and read_at is not null', n_m1))
      || pg_temp.rls_case('health worker', 'Mark all read: no one else''s', 'call', 'public.mark_all_notifications_read()',
           format('after:0:select 1 from public.notification where user_id <> %L and read_at = now()', u_hw))
      || pg_temp.rls_case('health worker', 'Notify all staff (database only)', 'call', 'public.notify_staff(''NEW_REQUEST'')', 'blocked')
      || pg_temp.rls_case('health worker', 'Count up a staff notice (database only)', 'call',
           'public.count_up_staff_notice(''SMS_FAILED'', true)', 'blocked')
      || pg_temp.rls_case('health worker', 'Notify admins of an account change (server only)', 'call',
           format('public.notify_account_change(''ACCOUNT_DEACTIVATED'', %L, %L)', u_m1, u_admin), 'blocked')
      || pg_temp.rls_case('health worker', 'Notify of a password reset (server only)', 'call',
           format('public.notify_password_reset(%L)', u_m1), 'blocked')
      || pg_temp.rls_case('health worker', 'Make the visit reminders (server only)', 'call', 'public.notify_visit_reminders()', 'blocked')
      || pg_temp.rls_case('health worker', 'Clear old notifications (server only)', 'call', 'public.clean_notifications()', 'blocked')

      || pg_temp.rls_case('inactive worker', 'Her notifications (none while inactive)', 'count', 'select 1 from public.notification', 'none')
      || pg_temp.rls_case('inactive worker', 'Mark all read (nothing while inactive)', 'call', 'public.mark_all_notifications_read()',
           'after:0:select 1 from public.notification where read_at = now()')

      || pg_temp.rls_case('admin', 'Notifications (only her own)', 'count', 'select 1 from public.notification',
           format('same:select 1 from public.notification where user_id = %L', u_admin))
      || pg_temp.rls_case('admin', 'A health worker''s notifications', 'count',
           format('select 1 from public.notification where user_id = %L', u_hw), 'none')
      || pg_temp.rls_case('admin', 'Mark a health worker''s notification read', 'call', format('public.mark_notification_read(%s)', n_hw),
           format('after:0:select 1 from public.notification where notification_id = %s and read_at is not null', n_hw))
      || pg_temp.rls_case('admin', 'Delete notifications', 'write', 'delete from public.notification', 'blocked')
      || pg_temp.rls_case('admin', 'Notify admins of an account change (server only)', 'call',
           format('public.notify_account_change(''ACCOUNT_DEACTIVATED'', %L, %L)', u_hw, u_admin), 'blocked');

    ----------------------------------------------------------------------------------------
    -- 3. Run each test in its own undone step
    ----------------------------------------------------------------------------------------
    for t in select value from jsonb_array_elements(tests) loop
      i := i + 1;
      expect := t ->> 'expect';
      actor_id := case t ->> 'actor'
        when 'admin' then u_admin when 'health worker' then u_hw
        when 'inactive worker' then u_hw_off when 'mother' then u_m1 end;
      got_rows := null; ref_rows := null; failed := null;

      -- What exists, as the script's owner.
      if expect = 'all' then
        execute 'select count(*) from (' || (t ->> 'sql') || ') as s' into ref_rows;
      elsif expect like 'same:%' then
        execute 'select count(*) from (' || substr(expect, 6) || ') as s' into ref_rows;
      elsif t ->> 'kind' = 'write' and (t ->> 'sql') like 'delete from public.follow_up where%' then
        select count(*) into ref_rows from public.follow_up;
      end if;

      begin
        perform set_config('request.jwt.claims',
          case when actor_id is null then '' else json_build_object('sub', actor_id, 'role', 'authenticated')::text end, true);
        execute case when actor_id is null then 'set local role anon' else 'set local role authenticated' end;

        if t ->> 'kind' = 'count' then
          execute 'select count(*) from (' || (t ->> 'sql') || ') as s' into got_rows;
        elsif t ->> 'kind' = 'write' then
          execute t ->> 'sql';
          get diagnostics got_rows = row_count;
        else
          execute 'select ' || (t ->> 'sql');
        end if;
        -- What the change left behind, counted as the script's owner.
        if expect like 'after:%' then
          execute 'reset role';
          execute 'select count(*) from (' || substring(expect from '^after:[0-9]+:(.*)$') || ') as s' into got_rows;
        end if;
        raise exception 'rls_test_step_undo';
      exception when others then
        if sqlerrm <> 'rls_test_step_undo' then
          failed := sqlerrm;
        end if;
      end;
      execute 'reset role';

      result := case
        when failed is not null then 'error: ' || left(failed, 80)
        when expect like 'after:%' then 'rows after: ' || got_rows
        when t ->> 'kind' = 'count' and ref_rows is not null then 'rows: ' || got_rows || ' of ' || ref_rows
        when t ->> 'kind' = 'count' then 'rows: ' || got_rows
        when t ->> 'kind' = 'write' then 'changed: ' || got_rows
        else 'ok' end;

      verdict := case
        when expect = 'info' then 'INFO'
        when expect = 'none' then case when failed is not null or got_rows = 0 then 'PASS' else 'FAIL' end
        when expect = 'all' then case when ref_rows = 0 then 'SKIP' when failed is null and got_rows = ref_rows then 'PASS' else 'FAIL' end
        when expect like 'eq:%' then case when failed is null and got_rows = substr(expect, 4)::bigint then 'PASS' else 'FAIL' end
        when expect like 'same:%' then case when failed is null and got_rows = ref_rows then 'PASS' else 'FAIL' end
        when expect = 'allowed' and ref_rows = 0 then 'SKIP'
        when expect = 'allowed' then case when failed is null and (t ->> 'kind' = 'call' or got_rows >= 1) then 'PASS' else 'FAIL' end
        when expect = 'blocked' then case when failed is not null or got_rows = 0 then 'PASS' else 'FAIL' end
        when expect like 'error:%' then case when failed like '%' || substr(expect, 7) || '%' then 'PASS' else 'FAIL' end
        when expect like 'after:%' then case when failed is null and got_rows = split_part(expect, ':', 2)::bigint then 'PASS' else 'FAIL' end
        else 'FAIL' end;

      results := results || jsonb_build_array(jsonb_build_object(
        'n', i, 'actor', t ->> 'actor', 'name', t ->> 'name', 'result', result,
        'expected', case when expect like 'same:%' then 'same as hers'
                         when expect like 'after:%' then 'rows after: ' || split_part(expect, ':', 2)
                         else expect end, 'verdict', verdict));
    end loop;

    raise exception 'rls_test_undo';
  exception when others then
    if sqlerrm <> 'rls_test_undo' then
      results := results || jsonb_build_array(jsonb_build_object(
        'n', 0, 'actor', 'script', 'name', 'Setting up the test records', 'result', 'error: ' || sqlerrm,
        'expected', 'no error', 'verdict', 'FAIL'));
    end if;
  end;

  insert into rls_results
  select (r ->> 'n')::int, r ->> 'actor', r ->> 'name', r ->> 'result', r ->> 'expected', r ->> 'verdict'
  from jsonb_array_elements(results) as r;
end $$;

-- Database-wide checks (no one acts; read from the catalog)
insert into rls_results
select 900, 'database', 'Every table has access rules (RLS) on',
       coalesce((select 'off: ' || string_agg(c.relname, ', ' order by c.relname)
                 from pg_class as c join pg_namespace as ns on ns.oid = c.relnamespace
                 where ns.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity), 'all on'),
       'all on', null
union all
select 901, 'database', 'Staff and SMS list views follow the reader''s rules',
       coalesce((select 'not: ' || string_agg(c.relname, ', ')
                 from pg_class as c join pg_namespace as ns on ns.oid = c.relnamespace
                 where ns.nspname = 'public' and c.relname in ('follow_up_item', 'sms_log_item')
                   and not coalesce(c.reloptions @> array['security_invoker=true'], false)), 'both'),
       'both', null
union all
select 902, 'database', 'Server-only functions the website''s login can run',
       coalesce((select string_agg(f, ', ') from unnest(array[
                   'public.claim_due_sms()', 'public.mark_missed_appointments()', 'public.clean_rate_limits()',
                   'public.call_sms_sender()', 'public.notify_visit_reminders()', 'public.clean_notifications()',
                   'public.add_notification(uuid, public.notification_type, jsonb, bigint, bigint, bigint)',
                   'public.notify_staff(public.notification_type, jsonb, boolean, bigint, bigint, uuid)',
                   'public.count_up_staff_notice(public.notification_type, boolean, date)',
                   'public.notify_account_change(public.notification_type, uuid, uuid)',
                   'public.notify_password_reset(uuid)']) as f
                 where has_function_privilege('authenticated', f, 'execute')
                    or has_function_privilege('anon', f, 'execute')), 'none'),
       'none', null
union all
select 903, 'database', 'Functions a logged-out visitor can run (owner rights)',
       coalesce((select string_agg(p.proname, ', ' order by p.proname)
                 from pg_proc as p join pg_namespace as ns on ns.oid = p.pronamespace
                 where ns.nspname = 'public' and p.prosecdef
                   and p.prorettype not in ('trigger'::regtype, 'event_trigger'::regtype)
                   and has_function_privilege('anon', p.oid, 'execute')), 'none'),
       'info', 'INFO'
union all
select 904, 'database', 'Notification changes the website''s login can make directly',
       coalesce((select string_agg(r || ' ' || lower(p), ', ')
                 from unnest(array['anon', 'authenticated']) as r, unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) as p
                 where has_table_privilege(r, 'public.notification', p)), 'none'),
       'none', null;

update rls_results set verdict = case when result = expected then 'PASS' else 'FAIL' end
where n between 900 and 902 or n = 904;

-- Every check, problems first ("same verdict" = how many checks got that verdict).
select verdict, count(*) over (partition by verdict) as same_verdict, actor, check_name, result, expected
from rls_results
order by case verdict when 'FAIL' then 0 when 'SKIP' then 1 when 'INFO' then 2 else 3 end, n;
