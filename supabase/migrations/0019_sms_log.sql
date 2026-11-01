-- 0019_sms_log.sql  (Phase 7 step 4: the SMS log)
-- Run once in the Supabase SQL editor, after 0018. Safe to run again.
-- Changes no data: it only adds a view and an index.
--
-- 1. sms_log_item: each text with its mother, service and appointment, so the
--    SMS log can search by her name or number and filter by type and date.
--    shown_at is the time the log shows and sorts by: when it went out, else
--    when it is next due (an automatic retry), else when it was first due.
--    security_invoker: whoever reads it sees only the texts their own access
--    rules allow (staff: all; a mother: her own).
-- 2. An index for the newest-first list.

-- 1. The view ---------------------------------------------------------------------------

create or replace view public.sms_log_item
with (security_invoker = true)
as
select
  s.reminder_id,
  s.appointment_id,
  s.reminder_type,
  s.recipient_number,
  s.sent_to,
  s.message_text,
  s.delivery_status,
  s.status_reason,
  s.attempt_count,
  s.scheduled_at,
  s.next_attempt_at,
  s.sent_at,
  s.delivered_at,
  coalesce(s.sent_at, s.next_attempt_at, s.scheduled_at) as shown_at,
  a.status as appointment_status,
  coalesce(a.scheduled_datetime, a.requested_datetime) as visit_at,
  t.name as service,
  m.mother_id,
  m.first_name,
  m.middle_name,
  m.last_name
from public.sms_reminder as s
join public.appointment as a on a.appointment_id = s.appointment_id
join public.pregnancy as p on p.pregnancy_id = a.pregnancy_id
join public.mother as m on m.mother_id = p.mother_id
join public.activity_type as t on t.activity_type_id = a.activity_type_id;

revoke all on public.sms_log_item from anon, authenticated;
grant select on public.sms_log_item to authenticated;

-- 2. Newest first -------------------------------------------------------------------------

create index if not exists sms_reminder_shown_at
  on public.sms_reminder ((coalesce(sent_at, next_attempt_at, scheduled_at)) desc, reminder_id desc);

-- Let the API see the view right away.
notify pgrst, 'reload schema';
