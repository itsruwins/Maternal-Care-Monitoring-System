-- 0023_rate_limits.sql  (Phase 9 step 2: abuse limits per network address)
-- Run once in the Supabase SQL editor, after 0022. Safe to run again.
--
-- Logins and sign-ups reach Supabase from our one server, so Supabase's own
-- limits count every user together. The app now also limits each network
-- address (checked on the server, before anything is looked up):
--   * login: 20 failed tries in 15 minutes (the 5-failures-per-username lock
--     stays as it is)
--   * sign-up: 20 per hour
--   * forgot password: 10 per hour
--
-- 1. rate_limit_hit: one row per counted try. The address is never stored:
--    the server keeps only a keyed hash of it (HMAC-SHA256 with the
--    RATE_LIMIT_SECRET environment variable). Holds no patient data. Only the
--    server (secret key) can read or write it: RLS is on with no policies.
-- 2. A daily clean-up (pg_cron, 3:00 AM Manila) deletes rows older than a day,
--    here and in login_attempt (whose old rows were only cleared per username).

-- 1. The attempt log -------------------------------------------------------------------------

create table if not exists public.rate_limit_hit (
  rate_limit_hit_id bigint generated always as identity primary key,
  action text not null check (action in ('login', 'signup', 'reset')),
  key_hash text not null,
  hit_at timestamptz not null default now()
);

create index if not exists rate_limit_hit_lookup_idx
  on public.rate_limit_hit (action, key_hash, hit_at desc);

create index if not exists rate_limit_hit_time_idx
  on public.rate_limit_hit (hit_at);

alter table public.rate_limit_hit enable row level security;

revoke all on table public.rate_limit_hit from anon, authenticated;

comment on table public.rate_limit_hit is
  'Counted login, sign-up and password-reset tries per hashed network address, for abuse limits. Server-only; rows older than a day are deleted daily.';

-- 2. Daily clean-up --------------------------------------------------------------------------

create index if not exists login_attempt_time_idx
  on public.login_attempt (attempted_at);

create or replace function public.clean_rate_limits()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limit_hit where hit_at < now() - interval '1 day';
  delete from public.login_attempt where attempted_at < now() - interval '1 day';
$$;

revoke execute on function public.clean_rate_limits() from public, anon, authenticated;

-- Every day at 19:00 UTC = 3:00 AM Manila. Running this file again replaces
-- the job instead of adding a second one.
select cron.schedule(
  'clean-rate-limits',
  '0 19 * * *',
  $$select public.clean_rate_limits();$$
);

-- Let the API see the new table right away.
notify pgrst, 'reload schema';
