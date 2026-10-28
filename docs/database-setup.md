# Database setup

Run these in **Supabase Dashboard → SQL Editor**, in order. Each file is safe to read before running; none of them delete data.

| # | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/0001_role_helpers.sql` | INACTIVE accounts lose access; adds `current_mother_id()` and `current_health_worker_id()` |
| 2 | `supabase/migrations/0002_username_rules.sql` | Usernames: lowercase, 3–30 chars, letters/numbers/`.`/`_` |
| 3 | `supabase/migrations/0003_one_active_pregnancy.sql` | Only one ACTIVE pregnancy per mother |
| 4 | `supabase/migrations/0004_mother_signup.sql` | Website sign-up creates `user_account` + `mother` + `pregnancy` together; username availability check |
| 5 | `supabase/migrations/0005_mother_self_service.sql` | Mother can cancel her own REQUESTED appointment; protects `registered_by`, `user_id`, `registration_date` |
| 6 | `supabase/migrations/0006_login_attempt.sql` | Table for the 5-failures → 15-minute lock |
| 7 | `supabase/migrations/0007_phase2.sql` | Phase 2: usernames 8+ characters for new accounts and renames; renames the first admin login `admin` → `taysan.admin`; health workers may edit their own name and contact |
| 8 | `supabase/migrations/0008_phase3.sql` | Phase 3: admin-managed purok list (Purok 1–10 to start) and `mother.purok_id` (existing typed puroks matched where clear); sign-up saves the chosen purok; past pregnancies allowed (EDD only required while active, outcome date checked against the LMP) |
| 9 | `supabase/migrations/0009_phase4.sql` | Phase 4: closed days; appointment slot rules (30-minute weekday slots 8–12 and 1–3, Manila time, not closed, not past; mothers from tomorrow up to 3 months); one appointment per slot; mother cancel / accept / decline functions; `taken_slots()`; SMS reminder queue kept in step with each appointment |
| 10 | `supabase/migrations/0010_service_icons.sql` | Phase 4: an icon for each service (activity type), picked by admins from a fixed set; the 5 existing services get fitting icons |
| 11 | `supabase/migrations/0011_more_services.sql` | Phase 4: adds Nutrition Counseling, Prenatal Dental Checkup, Fetal Heartbeat Check and Birth Plan Counseling (1-day reminder, with pictures); skips any that exist |
| 12 | `supabase/migrations/0012_remove_laboratory_test.sql` | Phase 4: deletes the Laboratory Test service; stops without deleting if any appointment or visit uses it (it stopped: 1 test appointment) |
| 13 | `supabase/migrations/0013_delete_laboratory_test.sql` | Phase 4: deletes Laboratory Test with its appointments and their SMS reminders (refuses if a recorded visit used it) |
| — | `supabase/seed/first-admin.sql` | First admin (follow the steps at the top of the file) |

## Rules

- Migrations are never edited after they've been run. Fixes go in a new numbered file.
- If a file fails, stop and send the error message. Don't run the next file.

## Environment variables (`.env.local`, never committed)

| Name | Used for | Phase |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | 0 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser/server client (RLS applies) | 0 |
| `SUPABASE_SECRET_KEY` | Server-only admin client: username login, staff accounts, password resets | 0 |
| `HTTPSMS_API_KEY`, `HTTPSMS_FROM_NUMBER`, `CRON_SECRET` | SMS sending | 7 |

On Vercel, add the same values under Project Settings → Environment Variables.
