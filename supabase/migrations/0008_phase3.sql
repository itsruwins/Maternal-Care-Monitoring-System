-- 0008_phase3.sql  (Phase 3: mothers & pregnancies)
-- Run once in the Supabase SQL editor, after 0001-0007.
--
-- 1. Purok list: a new `purok` table, managed by admins, starting with
--    Purok 1 to Purok 10 (no official list was found; admins can rename,
--    add or hide puroks later). Everyone can read the shown puroks, because
--    the public sign-up form needs them.
-- 2. `mother.purok_id` points to that list. Existing mothers are matched from
--    their typed purok when the text clearly names a number from 1 to 10
--    ("Purok 3", "Prk. 3", "P-3", "3"). Everyone else keeps an empty purok
--    until a health worker picks one. The old text column `purok_sitio` stays
--    for reference, but new records leave it empty.
-- 3. The website sign-up saves the chosen purok (purok_id).
-- 4. Pregnancy rules, so past pregnancies can be recorded:
--    * The EDD is only required while a pregnancy is ACTIVE (for past ones it
--      is often unknown).
--    * The outcome date used to have to be on or after the day the record was
--      made, which blocks entering a delivery from years ago. It now has to be
--      on or after the LMP instead (when the LMP is known).
--    * A closed pregnancy (DELIVERED or ENDED) must have an outcome and an
--      outcome date. Checked for new and changed rows only.
--
-- Nothing is deleted. Health workers' access to mothers and pregnancies is
-- unchanged (they could already add and update both).

-- 1. Purok list ---------------------------------------------------------------

create table if not exists public.purok (
  purok_id   bigint generated always as identity primary key,
  name       text not null check (char_length(trim(name)) between 1 and 60),
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists purok_name_unique on public.purok (lower(trim(name)));

alter table public.purok enable row level security;

grant select on public.purok to anon, authenticated;
grant insert, update on public.purok to authenticated;

drop policy if exists purok_select_shown on public.purok;
create policy purok_select_shown on public.purok
  for select to anon, authenticated
  using (is_active);

drop policy if exists purok_select_admin on public.purok;
create policy purok_select_admin on public.purok
  for select to authenticated
  using (public.current_user_role() = 'ADMIN');

drop policy if exists purok_admin_insert on public.purok;
create policy purok_admin_insert on public.purok
  for insert to authenticated
  with check (public.current_user_role() = 'ADMIN');

drop policy if exists purok_admin_update on public.purok;
create policy purok_admin_update on public.purok
  for update to authenticated
  using (public.current_user_role() = 'ADMIN')
  with check (public.current_user_role() = 'ADMIN');

-- No delete policy: mothers point to puroks, so admins hide them instead.

insert into public.purok (name, sort_order)
select 'Purok ' || n, n
from generate_series(1, 10) as n
on conflict do nothing;

-- 2. Mother's purok -------------------------------------------------------------

alter table public.mother
  add column if not exists purok_id bigint references public.purok (purok_id) on delete restrict;

create index if not exists mother_purok_id_idx on public.mother (purok_id);

alter table public.mother alter column purok_sitio drop not null;

-- Match existing typed puroks that clearly name a number from 1 to 10.
update public.mother as m
set purok_id = p.purok_id
from public.purok as p
where m.purok_id is null
  and p.name = 'Purok ' || (
    substring(
      lower(m.purok_sitio)
      from '^\s*(?:purok|prk|pk|p)?[\s.#-]*(?:no\.?)?[\s.#-]*0*([0-9]{1,2})(?![0-9])'
    )
  )::int;

-- New mothers must have a purok (existing ones without a match are left as is).
create or replace function public.require_mother_purok()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.purok_id is null then
    raise exception 'Purok is required' using errcode = '23502';
  end if;
  return new;
end;
$$;

revoke execute on function public.require_mother_purok() from public, anon, authenticated;

drop trigger if exists trg_mother_require_purok on public.mother;
create trigger trg_mother_require_purok
  before insert on public.mother
  for each row execute function public.require_mother_purok();

-- 3. Sign-up saves the chosen purok ----------------------------------------------
-- Same as 0004, except the address uses purok_id (a shown purok) instead of
-- typed text.

create or replace function public.handle_mother_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_mother_id bigint;
  v_purok_id bigint;
begin
  if coalesce(meta ->> 'registration', '') <> 'mother_self_signup' then
    return new;
  end if;

  if nullif(trim(meta ->> 'username'), '') is null
     or nullif(trim(meta ->> 'first_name'), '') is null
     or nullif(trim(meta ->> 'last_name'), '') is null
     or nullif(meta ->> 'date_of_birth', '') is null
     or nullif(meta ->> 'purok_id', '') is null
     or nullif(trim(meta ->> 'street_address'), '') is null
     or nullif(trim(meta ->> 'contact_number'), '') is null
     or nullif(trim(meta ->> 'emergency_contact_name'), '') is null
     or nullif(trim(meta ->> 'emergency_contact_no'), '') is null
     or nullif(meta ->> 'gravida', '') is null
     or nullif(meta ->> 'para', '') is null
     or nullif(meta ->> 'expected_delivery_date', '') is null then
    raise exception 'Incomplete mother registration' using errcode = '22023';
  end if;

  select p.purok_id into v_purok_id
  from public.purok as p
  where p.purok_id = (meta ->> 'purok_id')::bigint
    and p.is_active;

  if v_purok_id is null then
    raise exception 'Unknown purok' using errcode = '22023';
  end if;

  insert into public.user_account (user_id, username, role, account_status, created_at)
  values (new.id, lower(trim(meta ->> 'username')), 'MOTHER', 'ACTIVE', now());

  insert into public.mother (
    user_id, registered_by, first_name, middle_name, last_name, date_of_birth,
    purok_id, street_address, contact_number,
    emergency_contact_name, emergency_contact_no, registration_date
  )
  values (
    new.id,
    null,
    trim(meta ->> 'first_name'),
    nullif(trim(meta ->> 'middle_name'), ''),
    trim(meta ->> 'last_name'),
    (meta ->> 'date_of_birth')::date,
    v_purok_id,
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

-- 4. Pregnancy rules for past pregnancies ------------------------------------------

alter table public.pregnancy alter column expected_delivery_date drop not null;

alter table public.pregnancy drop constraint if exists pregnancy_active_needs_edd;
alter table public.pregnancy
  add constraint pregnancy_active_needs_edd
  check (pregnancy_status <> 'ACTIVE' or expected_delivery_date is not null);

alter table public.pregnancy drop constraint if exists pregnancy_check2;
alter table public.pregnancy drop constraint if exists pregnancy_outcome_after_lmp;
alter table public.pregnancy
  add constraint pregnancy_outcome_after_lmp
  check (outcome_date is null or lmp_date is null or outcome_date >= lmp_date);

alter table public.pregnancy drop constraint if exists pregnancy_closed_needs_outcome;
alter table public.pregnancy
  add constraint pregnancy_closed_needs_outcome
  check (pregnancy_status = 'ACTIVE' or (outcome is not null and outcome_date is not null))
  not valid;
