-- 0007_phase2.sql  (Phase 2: app shell + admin)
-- Run once in the Supabase SQL editor, after 0001-0006.
--
-- 1. Usernames must be at least 8 characters for new accounts and renames, so the
--    username can always serve as the default password (new staff accounts and
--    password resets use it, and force a change at the next login).
--    A trigger checks only when a username is created or changed, so existing
--    shorter usernames keep working (a plain CHECK would block every update of
--    those rows, even recording a login). The 0002 format rule (lowercase, 3-30,
--    letters/numbers/dots/underscores) stays as it is.
-- 2. Renames the first admin login from "admin" to "taysan.admin".
-- 3. Health workers may update their own staff profile (name and contact number).
--    Position, user and id stay admin-only, enforced by a trigger.
--
-- "Must change password" is stored in the login's protected app_metadata
-- (set only with the secret key on the server), so no column is added here.

-- 1. Minimum username length for new usernames --------------------------------

create or replace function public.check_username_min_length()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT' or new.username is distinct from old.username)
     and char_length(new.username) < 8 then
    raise exception 'Username must be at least 8 characters'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.check_username_min_length() from public, anon, authenticated;

drop trigger if exists trg_user_account_username_min_length on public.user_account;
create trigger trg_user_account_username_min_length
  before insert or update of username on public.user_account
  for each row execute function public.check_username_min_length();

-- 2. Rename the first admin login ------------------------------------------------
-- Only the username changes; the password and email stay the same.

update public.user_account
set username = 'taysan.admin'
where username = 'admin';

-- 3. Health workers can edit their own profile ------------------------------------

drop policy if exists hw_update_own on public.health_worker;
create policy hw_update_own on public.health_worker
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.guard_health_worker_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only health workers editing through their own login are limited; admins and
  -- server code using the secret key (no user role) can change everything.
  if public.current_user_role() = 'HEALTH_WORKER' and (
       new.position is distinct from old.position
    or new.user_id is distinct from old.user_id
    or new.health_worker_id is distinct from old.health_worker_id
  ) then
    raise exception 'Only an admin can change position or account links'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_health_worker_self_update() from public, anon, authenticated;

drop trigger if exists trg_health_worker_guard_self_update on public.health_worker;
create trigger trg_health_worker_guard_self_update
  before update on public.health_worker
  for each row execute function public.guard_health_worker_self_update();
