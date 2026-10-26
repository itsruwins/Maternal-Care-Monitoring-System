-- 0006_login_attempt.sql
-- Technical helper table (not part of the ERD data model): records failed
-- logins per username so the app can lock a username for 15 minutes after
-- 5 failed attempts. Holds no patient data.
-- Only the server (secret key) can read or write it: RLS is on with no policies.

create table if not exists public.login_attempt (
  login_attempt_id bigint generated always as identity primary key,
  username text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists login_attempt_username_time_idx
  on public.login_attempt (username, attempted_at desc);

alter table public.login_attempt enable row level security;

revoke all on table public.login_attempt from anon, authenticated;

comment on table public.login_attempt is
  'Failed login attempts per username, for login lockout. Server-only.';
