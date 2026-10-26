-- first-admin.sql
-- Gives an existing Supabase Auth user the ADMIN role, a username,
-- and a health worker profile. Run ONCE, after the migrations.
--
-- Step 1: Supabase Dashboard → Authentication → Users → Add user → Create new user.
--         Enter the admin's email and password, keep "Auto Confirm User" checked.
-- Step 2: Replace every value marked CHANGE ME below, then run this in the SQL Editor.
-- Step 3: Log in on the website with the USERNAME (not the email) and the password.

do $$
declare
  -- CHANGE ME ↓
  v_email          text := 'admin@example.com';   -- the email used in Step 1
  v_username       text := 'admin';               -- lowercase, 3-30 chars: a-z 0-9 . _
  v_first_name     text := 'Roince';
  v_middle_name    text := 'Rodriguez';                  -- or 'Santos'
  v_last_name      text := 'Jumao-as';
  v_position       text := 'Midwife';
  v_contact_number text := '09542440254';
  -- CHANGE ME ↑

  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = lower(v_email);

  if v_user_id is null then
    raise exception 'No Auth user with email %. Do Step 1 first.', v_email;
  end if;

  insert into public.user_account (user_id, username, role, account_status, created_at)
  values (v_user_id, lower(v_username), 'ADMIN', 'ACTIVE', now());

  insert into public.health_worker (user_id, first_name, middle_name, last_name, position, contact_number)
  values (v_user_id, v_first_name, v_middle_name, v_last_name, v_position, v_contact_number);

  raise notice 'Admin "%" created.', lower(v_username);
end;
$$;
