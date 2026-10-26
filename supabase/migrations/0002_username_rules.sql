-- 0002_username_rules.sql
-- Usernames are stored in lowercase only, 3-30 characters:
-- letters, numbers, dots and underscores; must start and end with a letter or number.
-- Because only lowercase is allowed, the existing UNIQUE (username) constraint
-- makes usernames case-insensitive ("Maria" and "maria" can't both exist).
-- The app lowercases usernames before saving and before login.

alter table public.user_account
  add constraint user_account_username_format
  check (username ~ '^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$');
