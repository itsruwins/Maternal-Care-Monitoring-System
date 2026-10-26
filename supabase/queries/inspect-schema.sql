-- Read-only. Run in Supabase Dashboard → SQL Editor, then copy the single JSON result.
-- Shows the current security rules, triggers, functions and lookup data so new
-- migrations don't clash with what already exists.
select json_build_object(
  'rls_enabled', (
    select json_agg(json_build_object('table', c.relname, 'rls', c.relrowsecurity) order by c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  ),
  'policies', (
    select json_agg(json_build_object(
      'table', tablename, 'name', policyname, 'cmd', cmd, 'roles', roles,
      'using', qual, 'check', with_check) order by tablename, policyname)
    from pg_policies where schemaname = 'public'
  ),
  'constraints', (
    select json_agg(json_build_object(
      'table', conrelid::regclass::text, 'name', conname, 'def', pg_get_constraintdef(oid)) order by conrelid::regclass::text)
    from pg_constraint
    where connamespace = 'public'::regnamespace and contype in ('u', 'c', 'f')
  ),
  'triggers', (
    select json_agg(json_build_object(
      'table', event_object_schema || '.' || event_object_table, 'name', trigger_name,
      'timing', action_timing, 'event', event_manipulation, 'action', action_statement))
    from information_schema.triggers
    where event_object_schema in ('public', 'auth')
  ),
  'functions', (
    select json_agg(json_build_object(
      'name', p.proname, 'args', pg_get_function_arguments(p.oid),
      'returns', pg_get_function_result(p.oid), 'security_definer', p.prosecdef, 'body', p.prosrc))
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  ),
  'enums', (
    select json_agg(json_build_object(
      'type', t.typname,
      'values', (select json_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid = t.oid)))
    from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typtype = 'e'
  ),
  'activity_types', (select json_agg(a) from public.activity_type a),
  'row_counts', json_build_object(
    'user_account', (select count(*) from public.user_account),
    'health_worker', (select count(*) from public.health_worker),
    'mother', (select count(*) from public.mother)
  ),
  'extensions', (select json_agg(extname) from pg_extension)
) as schema_info;
