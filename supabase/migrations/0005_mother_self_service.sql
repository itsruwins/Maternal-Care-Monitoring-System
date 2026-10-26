-- 0005_mother_self_service.sql
-- 1. A mother can cancel her own appointment request, only while it is REQUESTED.
-- 2. A mother can edit her own profile, but not who registered her, her login
--    link, or her registration date. Staff are not affected.

create or replace function public.cancel_my_appointment(p_appointment_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.appointment as a
  set status = 'CANCELLED'
  from public.pregnancy as p
  where a.appointment_id = p_appointment_id
    and p.pregnancy_id = a.pregnancy_id
    and p.mother_id = public.current_mother_id()
    and a.status = 'REQUESTED';

  if not found then
    raise exception 'Appointment not found or can no longer be cancelled'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.cancel_my_appointment(bigint) from public, anon;
grant execute on function public.cancel_my_appointment(bigint) to authenticated;

create or replace function public.guard_mother_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() = 'MOTHER' and (
       new.user_id is distinct from old.user_id
    or new.registered_by is distinct from old.registered_by
    or new.registration_date is distinct from old.registration_date
  ) then
    raise exception 'These fields can only be changed by health center staff'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_mother_self_update() from public, anon, authenticated;

drop trigger if exists trg_mother_guard_self_update on public.mother;
create trigger trg_mother_guard_self_update
  before update on public.mother
  for each row execute function public.guard_mother_self_update();
