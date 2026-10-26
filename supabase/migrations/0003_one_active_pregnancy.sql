-- 0003_one_active_pregnancy.sql
-- Business rule from the ERD: a mother has at most one ACTIVE pregnancy.
-- Past pregnancies (DELIVERED / ENDED) are unlimited.

create unique index if not exists pregnancy_one_active_per_mother
  on public.pregnancy (mother_id)
  where pregnancy_status = 'ACTIVE';
