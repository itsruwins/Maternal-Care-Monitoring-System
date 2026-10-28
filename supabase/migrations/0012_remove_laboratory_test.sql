  -- 0012_remove_laboratory_test.sql  (Phase 4: remove a service)
  -- Run once in the Supabase SQL editor, after 0011.
  --
  -- Deletes the "Laboratory Test" service (activity type), at the client's
  -- request. Appointments and visit services point to services and block the
  -- delete, so this first checks whether any use it. If some do, it stops with
  -- a message saying how many and deletes nothing (nothing else is touched).
  -- If the service is already gone, it does nothing.

  do $$
  declare
    v_id bigint;
    v_appointments integer;
    v_visit_services integer;
  begin
    select activity_type_id into v_id
    from public.activity_type
    where lower(name) = 'laboratory test';

    if v_id is null then
      raise notice 'Laboratory Test is already gone. Nothing to do.';
      return;
    end if;

    select count(*) into v_appointments from public.appointment where activity_type_id = v_id;
    select count(*) into v_visit_services from public.visit_service where activity_type_id = v_id;

    if v_appointments > 0 or v_visit_services > 0 then
      raise exception 'Laboratory Test is still used by % appointment(s) and % visit service(s). Nothing was deleted.',
        v_appointments, v_visit_services;
    end if;

    delete from public.activity_type where activity_type_id = v_id;
    raise notice 'Laboratory Test deleted.';
  end;
  $$;
