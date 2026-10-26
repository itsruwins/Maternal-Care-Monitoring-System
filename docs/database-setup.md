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
| 7 | `supabase/seed/first-admin.sql` | First admin (follow the steps at the top of the file) |

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
