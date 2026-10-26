-- 0004_mother_signup.sql
-- When a mother signs up on the website, create her user_account (MOTHER, ACTIVE),
-- mother profile and ACTIVE pregnancy in the same transaction as the login.
-- If anything fails, the whole sign-up fails: no half-created accounts.
--
-- Safety:
-- * Only acts when the sign-up metadata has registration = 'mother_self_signup'.
--   Users created any other way (Dashboard, admin-created staff) are ignored.
-- * The role is always MOTHER. A role sent from the browser is never read.

create or replace function public.handle_mother_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_mother_id bigint;
begin
  if coalesce(meta ->> 'registration', '') <> 'mother_self_signup' then
    return new;
  end if;

  if nullif(trim(meta ->> 'username'), '') is null
     or nullif(trim(meta ->> 'first_name'), '') is null
     or nullif(trim(meta ->> 'last_name'), '') is null
     or nullif(meta ->> 'date_of_birth', '') is null
     or nullif(trim(meta ->> 'purok_sitio'), '') is null
     or nullif(trim(meta ->> 'street_address'), '') is null
     or nullif(trim(meta ->> 'contact_number'), '') is null
     or nullif(trim(meta ->> 'emergency_contact_name'), '') is null
     or nullif(trim(meta ->> 'emergency_contact_no'), '') is null
     or nullif(meta ->> 'gravida', '') is null
     or nullif(meta ->> 'para', '') is null
     or nullif(meta ->> 'expected_delivery_date', '') is null then
    raise exception 'Incomplete mother registration' using errcode = '22023';
  end if;

  insert into public.user_account (user_id, username, role, account_status, created_at)
  values (new.id, lower(trim(meta ->> 'username')), 'MOTHER', 'ACTIVE', now());

  insert into public.mother (
    user_id, registered_by, first_name, middle_name, last_name, date_of_birth,
    purok_sitio, street_address, contact_number,
    emergency_contact_name, emergency_contact_no, registration_date
  )
  values (
    new.id,
    null,
    trim(meta ->> 'first_name'),
    nullif(trim(meta ->> 'middle_name'), ''),
    trim(meta ->> 'last_name'),
    (meta ->> 'date_of_birth')::date,
    trim(meta ->> 'purok_sitio'),
    trim(meta ->> 'street_address'),
    trim(meta ->> 'contact_number'),
    trim(meta ->> 'emergency_contact_name'),
    trim(meta ->> 'emergency_contact_no'),
    current_date
  )
  returning mother_id into v_mother_id;

  insert into public.pregnancy (
    mother_id, gravida, para, lmp_date, expected_delivery_date,
    pregnancy_status, registration_date
  )
  values (
    v_mother_id,
    (meta ->> 'gravida')::int,
    (meta ->> 'para')::int,
    nullif(meta ->> 'lmp_date', '')::date,
    (meta ->> 'expected_delivery_date')::date,
    'ACTIVE',
    current_date
  );

  return new;
end;
$$;

revoke execute on function public.handle_mother_signup() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_mother_signup on auth.users;
create trigger on_auth_user_created_mother_signup
  after insert on auth.users
  for each row execute function public.handle_mother_signup();

-- Live "is this username free?" check on the sign-up form.
-- Usernames are not secret; this reveals nothing else.
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.user_account
    where username = lower(trim(p_username))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
