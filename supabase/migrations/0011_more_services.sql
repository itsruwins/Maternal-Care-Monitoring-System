-- 0011_more_services.sql  (Phase 4: more prenatal services)
-- Run once in the Supabase SQL editor, after 0010.
--
-- Adds four prenatal services that mothers can request and staff can book,
-- each with its picture and a reminder 1 day before. Services that already
-- exist (same name, any letter case) are skipped, so it is safe to run again.
-- Admins can edit them later on Admin -> Activity types.

insert into public.activity_type (name, description, reminder_days_before, icon)
select v.name, v.description, 1, v.icon
from (
  values
    ('Nutrition Counseling', 'Diet and healthy weight advice during pregnancy', 'nutrition'),
    ('Prenatal Dental Checkup', 'Oral health check for pregnant women', 'dental'),
    ('Fetal Heartbeat Check', 'Listening to the baby''s heartbeat', 'heartbeat'),
    ('Birth Plan Counseling', 'Planning where and how to give birth, and what to prepare', 'counseling')
) as v(name, description, icon)
where not exists (
  select 1 from public.activity_type as t where lower(t.name) = lower(v.name)
);
