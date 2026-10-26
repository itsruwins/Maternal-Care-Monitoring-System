-- 0001_role_helpers.sql
-- 1. INACTIVE accounts lose all role-based access: current_user_role() now
--    returns NULL for them, so every existing RLS policy denies them.
-- 2. Helpers to get the logged-in user's mother_id / health_worker_id.

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select ua.role::text
  from public.user_account as ua
  where ua.user_id = (select auth.uid())
    and ua.account_status = 'ACTIVE'
  limit 1;
$$;

create or replace function public.current_mother_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select m.mother_id
  from public.mother as m
  where m.user_id = (select auth.uid())
    and public.current_user_role() = 'MOTHER'
  limit 1;
$$;

create or replace function public.current_health_worker_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select hw.health_worker_id
  from public.health_worker as hw
  where hw.user_id = (select auth.uid())
    and public.current_user_role() in ('ADMIN', 'HEALTH_WORKER')
  limit 1;
$$;

revoke execute on function public.current_mother_id() from public, anon;
revoke execute on function public.current_health_worker_id() from public, anon;
grant execute on function public.current_mother_id() to authenticated;
grant execute on function public.current_health_worker_id() to authenticated;
