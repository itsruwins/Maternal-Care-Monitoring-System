-- 0013_delete_laboratory_test.sql  (Phase 4: remove a service, with its bookings)
-- Run once in the Supabase SQL editor. Replaces 0012, which stopped because a
-- test appointment still used the service.
--
-- At the client's request, deletes the "Laboratory Test" service together with
-- the appointments booked for it and their SMS reminders. It still refuses if a
-- recorded visit used the service (visit records are never deleted here).
-- All in one step: if anything fails, nothing is deleted. Can't be undone.

do $$
declare
  v_id bigint;
  v_visit_services integer;
  v_reminders integer;
  v_appointments integer;
begin
  select activity_type_id into v_id
  from public.activity_type
  where lower(name) = 'laboratory test';

  if v_id is null then
    raise notice 'Laboratory Test is already gone. Nothing to do.';
    return;
  end if;

  select count(*) into v_visit_services from public.visit_service where activity_type_id = v_id;
  if v_visit_services > 0 then
    raise exception 'Laboratory Test is used by % recorded visit service(s). Nothing was deleted.', v_visit_services;
  end if;

  delete from public.sms_reminder
  where appointment_id in (select appointment_id from public.appointment where activity_type_id = v_id);
  get diagnostics v_reminders = row_count;

  delete from public.appointment where activity_type_id = v_id;
  get diagnostics v_appointments = row_count;

  delete from public.activity_type where activity_type_id = v_id;

  raise notice 'Laboratory Test deleted, with % appointment(s) and % SMS reminder(s).', v_appointments, v_reminders;
end;
$$;
