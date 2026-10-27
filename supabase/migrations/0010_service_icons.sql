-- 0010_service_icons.sql  (Phase 4: service tiles)
-- Run once in the Supabase SQL editor, after 0001-0009.
--
-- Each activity type (service) gets an icon key, picked by admins from a fixed
-- set, shown on the "Request a visit" service tiles and elsewhere. The five
-- existing services get fitting icons; anything else starts as "checkup".
-- Nothing is deleted.

alter table public.activity_type
  add column if not exists icon text not null default 'checkup';

alter table public.activity_type drop constraint if exists activity_type_icon_check;
alter table public.activity_type
  add constraint activity_type_icon_check check (icon in (
    'checkup', 'vaccine', 'supplement', 'lab', 'education', 'heartbeat',
    'baby', 'heart', 'nutrition', 'dental', 'blood', 'counseling'
  ));

update public.activity_type
set icon = case
  when name ilike '%vaccin%' or name ilike '%tetanus%' then 'vaccine'
  when name ilike '%iron%' or name ilike '%folic%' or name ilike '%supplement%' then 'supplement'
  when name ilike '%lab%' then 'lab'
  when name ilike '%education%' or name ilike '%session%' or name ilike '%class%' then 'education'
  else 'checkup'
end
where icon = 'checkup';
