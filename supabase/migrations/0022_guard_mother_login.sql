-- 0022_guard_mother_login.sql  (Phase 9 step 1: security fix)
-- Run once in the Supabase SQL editor, after 0021. Safe to run again.
--
-- The problem: health workers may update any mother row, and nothing stopped
-- them changing mother.user_id (the login linked to her record). Pointing a
-- record at a staff login and then pressing "Reset password" on it would have
-- reset that staff login. The app now refuses to reset anything but a mother's
-- login; this file closes the database side too.
--
-- The rule, for anyone logged in (staff and mothers):
--   * A record's login can only be set when the record has none yet (register
--     a mother with a login, or "Create a login" on her record), and only to a
--     MOTHER login that no other record uses.
--   * Once set, it can't be changed or removed.
-- The website sign-up trigger and the server's secret key are not affected
-- (no logged-in user there), so sign-up and the clean-up after a failed
-- registration keep working. Changes no data.

create or replace function public.guard_mother_login_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- No logged-in user: the sign-up trigger or the server's secret key.
  if (select auth.uid()) is null then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.user_id is not distinct from old.user_id then
    return new;
  end if;
  if new.user_id is null and tg_op = 'INSERT' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.user_id is not null then
    raise exception 'login_link_locked' using errcode = '42501';
  end if;

  if not exists (
       select 1 from public.user_account as ua
       where ua.user_id = new.user_id and ua.role = 'MOTHER'
     )
     or exists (
       select 1 from public.mother as m
       where m.user_id = new.user_id and m.mother_id is distinct from new.mother_id
     ) then
    raise exception 'login_link_invalid' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_mother_login_link() from public, anon, authenticated;

drop trigger if exists trg_mother_guard_login_link on public.mother;
create trigger trg_mother_guard_login_link
  before insert or update of user_id on public.mother
  for each row execute function public.guard_mother_login_link();
