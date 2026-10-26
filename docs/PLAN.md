# Maternal Care Monitoring System with SMS Reminder — Build Plan

Barangay Taysan, Legazpi City · Next.js 16 + Supabase · Hosted on Vercel

Status: **Phase 0 complete (verified 2026-10-26), awaiting your sign-off**. Each phase ends with a demo and your sign-off before the next starts.

---

## Agreed decisions

| Topic | Decision |
|---|---|
| Roles | ADMIN, HEALTH_WORKER (BHW / midwife), MOTHER |
| Login | Username + password. Email is optional and only used for password recovery. |
| Mothers without email | Login still works. If they forget their password, a health worker resets it. |
| Mother sign-up | Self sign-up, account ACTIVE immediately (email confirmation is off in Supabase). |
| Staff accounts | Created by an admin only. No public staff sign-up. |
| First admin | You add the user in Supabase Dashboard → Authentication → Add user, then run a seed SQL that gives it ADMIN role, a username and a health worker profile. |
| Name | **Taysan MaternaCare** (short); full title on the landing page. |
| Language | English + Filipino toggle (UI and SMS). The choice is saved in a cookie; web addresses stay the same (no `/en` or `/fil`). Built with simple JSON dictionaries (`src/i18n/`), no translation library. |
| Next.js Cache Components | Kept on (Next 16 default): pages are pre-built and load instantly; anything that reads the login loads inside a `<Suspense>` boundary. |
| Secrets | All in `.env.local` (git-ignored); on Vercel, set as environment variables. No Edge Functions. |
| Hosting | Vercel for the app. Scheduled jobs run with Supabase `pg_cron`. |
| SMS | HTTPSMS. Built last, with a test mode that logs messages without sending. |
| Out of scope | Diagnosis, prescriptions, treatment, delivery management, newborn care. |

## What's already in the database (checked 2026-10-26)

- All 10 ERD tables exist with every ERD column (singular names: `user_account`, `mother`, `pregnancy`, ...).
- `user_account.user_id`, `mother.user_id`, `health_worker.user_id` are UUIDs → linked to Supabase Auth users.
- Other IDs are `bigint`. `password_hash` was dropped (Supabase Auth stores passwords) — correct.
- Enums exist: `user_role`, `account_status`, `pregnancy_status`, `appointment_status`, `sms_delivery_status`, `follow_up_method` (+ reminder type, pregnancy outcome).
- RLS is on for all tables with role-based policies using `current_user_role()`. The 5 activity types are seeded. Triggers: only `appointment.updated_at`. No users yet. Extensions: no `pg_cron` / `pg_net` yet.

### Gaps found in the database (fixed by Phase 0 migrations)

1. **Mothers can't sign up:** only admins can insert `user_account`; only staff can insert `pregnancy`. → Sign-up trigger on `auth.users` (security definer).
2. **INACTIVE accounts keep access:** `current_user_role()` ignores `account_status`. → Return NULL for inactive users; the login function also blocks them.
3. **Role escalation risk:** the trigger must never trust a role sent from the browser. → Always MOTHER on self sign-up. Staff accounts are created by server code using the secret key, never by the trigger.
4. **One ACTIVE pregnancy per mother isn't enforced.** → Partial unique index.
5. Mother can't cancel her own request. → `cancel_my_appointment()` RPC (only her own, only while REQUESTED).
6. Mother can update every column of her own `mother` row, including `registered_by`. → Restrict editable columns.
7. Usernames are case-sensitive with no format rule. → Case-insensitive unique index + format check.
8. `pg_cron` / `pg_net` not enabled. → Added in Phases 6–7.
9. No users exist. → Steps + seed SQL to create the first admin (Dashboard user + `supabase/seed/first-admin.sql`).
10. **The sign-up trigger would also fire for users created any other way** (Dashboard, admin-created staff), turning them into mothers. → The trigger only acts when the sign-up carries the website's mother-registration marker; every other new user is ignored.
11. **No protection against password guessing.** Logins run through our server, so Supabase sees every attempt as coming from one place and its own limits don't protect individual accounts. → A small helper table `login_attempt` (technical only, not part of the ERD data) limits failed attempts per username, e.g. a 15-minute lock after 5 failures.

## Design direction

- **Feel:** calm, clinical-but-warm SaaS. Lots of whitespace, soft cards, clear status colors, smooth but quick motion. Mobile-first for mothers; dense, efficient tables for staff.
- **Palette** (from your color scheme):
  - Green `#769382` — accents, highlights, charts
  - Deep green `~#4F6B5E` (new) — primary buttons and text links (the light green fails contrast on white)
  - Beige `#E8DDC9` (the image label is a typo) — warm section backgrounds
  - Sage `#C0C3B9` — borders, muted UI
  - Cream `#F3EFE3` — page background
  - Plus muted status colors: requested, confirmed, completed, missed, cancelled
- **Design files:** `PRODUCT.md` (product facts, done) and `DESIGN.md` (visual system, after you pick a direction).
- **Logo:** the barangay seal shown small on a neutral circle, next to a clean text wordmark. Its bright colors are not used in the UI palette.
- **Tools:** `/impeccable` to set the design system and review screens, `/apple-design` + `emil-design-eng` for motion and interaction polish.
- **Stack:** Tailwind v4 (already installed), shadcn/ui (accessible components), Motion, React Hook Form + Zod (forms), Lucide icons, Sonner (toasts), a chart library for reports. Exact versions checked against Next 16 at install time.

## Folder structure & code conventions

The code is grouped by **feature**: everything about one feature (e.g. appointments) lives in one folder, split into files by purpose. We avoid one file per function, which scatters related code.

```
maternal-care-monitoring-system/
├── src/
│   ├── app/                        # Routes only: thin pages that call features
│   │   ├── [lang]/                 # Hidden language level (en / fil); proxy.ts adds it, URLs never show it
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── (public)/           # Landing page (public layout)
│   │   │   ├── (auth)/             # login, register, forgot-password, reset-password
│   │   │   └── (dashboard)/        # Shared app shell (sidebar, top bar)
│   │   │       ├── admin/          # Admin screens
│   │   │       ├── staff/          # Health worker screens
│   │   │       └── mother/         # Mother portal
│   │   └── globals.css             # Design tokens (colors, fonts, spacing)
│   │
│   ├── features/                   # One folder per feature
│   │   ├── auth/
│   │   ├── accounts/               # Admin: staff accounts
│   │   ├── activity-types/
│   │   ├── mothers/
│   │   ├── pregnancies/
│   │   ├── appointments/
│   │   ├── visits/                 # Prenatal visits + services
│   │   ├── follow-ups/
│   │   ├── sms/
│   │   ├── reports/
│   │   └── landing/
│   │
│   ├── components/
│   │   ├── ui/                     # Base building blocks (button, input, dialog…)
│   │   ├── layout/                 # Sidebar, top bar, bottom nav
│   │   └── shared/                 # Reused pieces (status badge, data table, empty state)
│   │
│   ├── lib/
│   │   ├── supabase/               # Browser + server clients, and a server-only admin client (secret key)
│   │   ├── auth/                   # getCurrentUser(), requireRole()
│   │   └── utils/                  # Dates (AOG, EDD), formatting, helpers
│   │
│   ├── i18n/                       # dictionaries/en.json + fil.json, config, provider, language action
│   ├── config/                     # Health center info, navigation menus
│   ├── types/                      # Database types
│   └── proxy.ts                    # Session refresh + role redirects
│
├── supabase/
│   ├── migrations/                 # Numbered .sql files you run in order
│   ├── seed/                       # First admin setup
│   └── queries/                    # Read-only helper queries
│
├── public/brand/                   # Logo files
└── docs/                           # PLAN.md, user guides
```

**Inside each feature folder** (example: `features/appointments/`):

```
appointments/
├── components/          # One component per file (request-form.tsx, review-dialog.tsx…)
├── actions.ts           # Server actions: create, confirm, reschedule, cancel
├── queries.ts           # Server-only data reads (lists, details)
├── schemas.ts           # Form validation rules (Zod)
├── types.ts             # Types for this feature
└── utils.ts             # Helpers used only by this feature (if needed)
```

A file that grows too big (around 300 lines) becomes a folder, e.g. `actions/confirm.ts`, `actions/reschedule.ts`.

**Rules:**
1. **Pages stay thin.** Files in `app/` only load data from `queries.ts` and render feature components. No business logic in pages.
2. **Features don't reach into each other's internals.** Anything used by two or more features moves to `components/shared` or `lib`.
3. **Server-only code is marked** with `import 'server-only'` so it can never be bundled into the browser.
4. **Every permission check happens on the server** (`requireRole()` in layouts and actions), on top of the database RLS. `proxy.ts` only does quick redirects.
5. **No hard-coded UI text.** All text comes from `i18n/en.json` and `fil.json`.
6. **Naming:** files and folders in `kebab-case`, components in `PascalCase`, one component per file, and no catch-all `index.ts` re-export files.
7. **Migrations are numbered** (`0001_signup_trigger.sql`, `0002_…`), never edited after you've run them. Changes go in a new file.

## How username login works

Supabase Auth only signs in with email, and no username login exists in the database yet (confirmed), so:

1. **Sign up:** the Auth user is created with the mother's real email, or a hidden placeholder email if she has none. Her details are sent along with the sign-up, marked as a website mother registration, and a database trigger creates `user_account` (MOTHER, ACTIVE) + `mother` + ACTIVE `pregnancy` in the same step. If any insert fails, the whole sign-up fails, so there are no half-created accounts. The username is saved in `user_account.username` (unique, case-insensitive).
2. **Placeholder email:** mothers without email get `<username>@no-email.taysan-maternacare.invalid` (`.invalid` is reserved and can never receive mail; confirmed working with Supabase in Phase 0). It is never shown, and no email is ever sent to it.
3. **Log in:** a server action checks the attempt limit → looks up the username → email with the server-only admin client → signs in and sets the session cookie. INACTIVE accounts are refused. Errors are always generic ("wrong username or password"). Emails are never sent to the browser.
4. **Forgot password:** the user enters username or email. If a real email is on file, Supabase sends a reset link to `/reset-password`. If only a placeholder exists, nothing is sent and the screen says to ask a health worker. The message is the same either way, so it doesn't reveal whether an account exists.
5. **Staff reset:** a health worker or admin sets a temporary password (server action); the user is asked to change it on next login.

### Secrets and database changes

- **`.env.local`** (git-ignored) holds every secret. Only names without `NEXT_PUBLIC_` stay on the server.
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: already there
  - `SUPABASE_SECRET_KEY`: Phase 0 (username login, staff accounts, password resets)
  - `HTTPSMS_API_KEY`, `HTTPSMS_FROM_NUMBER`, `CRON_SECRET`: Phase 7
- **The secret key is read in one file only**, `src/lib/supabase/admin.ts`, marked `server-only`.
- **On Vercel:** the same values go in Project Settings → Environment Variables.
- **Schema changes:** written as numbered files in `supabase/migrations/`. You review and run them yourself in the SQL Editor.

---

## Phase 0 — Foundation

Goal: everything later phases depend on.

- Move `app/` into `src/` and set up the folder structure above.
- Install and configure the stack (Supabase, forms, validation, icons, motion). Design tokens, fonts and base components move to the start of Phase 1, chosen together with the landing page.
- Supabase clients: browser and server (publishable key), plus the server-only admin client (secret key). TypeScript types written from the confirmed schema.
- `proxy.ts` (Next 16's renamed middleware) to refresh the session and do quick role redirects; real permission checks on the server in each layout and action.
- Translations setup (EN/FIL) with a language switch saved in a cookie.
- **Migration files for you to run** (fixing gaps 1–7, 10 and 11 above). Your existing RLS policies and seeded activity types stay; these only add to them:
  - `current_user_role()` returns nothing for INACTIVE accounts
  - helper functions (current mother id, current health worker id)
  - sign-up trigger (website mother registrations only) + username availability check
  - one ACTIVE pregnancy per mother; case-insensitive username + format check
  - `cancel_my_appointment()`; limit which `mother` fields a mother can edit
  - `login_attempt` table for login protection
- **Seed:** `supabase/seed/first-admin.sql` + step-by-step instructions.
- **Login server action** with the attempt limit and inactive-account check.

**Needs from you:** `SUPABASE_SECRET_KEY` added to `.env.local`; run the migrations; create the first admin.

Done when: the app runs, the first admin can log in with a username and land on an empty page for their role, a test mother can't see another mother's data, an INACTIVE account can't log in, and 5 wrong passwords lock the username for 15 minutes.

### Phase 0 verification (2026-10-26): 32/32 checks passed

Sign-up step (creates the records, rejects bad or incomplete data with nothing left behind, ignores a requested ADMIN role, ignores logins made other ways), username check, mothers isolated from each other, field guard, cancelling own request, one active pregnancy, inactive health worker loses access, and on the real login page: login by username (any letter case) → role page, inactive refused, unknown username → generic error, 5 wrong passwords → 15-minute lock. All test accounts deleted afterwards.

Known limit: a deactivated mother keeps read access to **her own** records until her current session expires (about 1 hour); she can't log in again. Staff lose access immediately.

## Phase 1 — Landing page + authentication

- **Visual direction first:** you choose a visual direction for the landing page (design skill process). It becomes the whole app's design system: tokens in `globals.css`, fonts, base components (button, input, select, dialog, sheet, table, badge, card, toast, stepper). `DESIGN.md` is written from the finished build.
- **Landing page:** hero, services (the 5 activity types), how it works (sign up → request → SMS reminder → visit), health center info (address, clinic days and hours, contact, map), maternal health tips (general, not medical advice), footer. Fully bilingual and responsive.
- **Login modal:** username + password, show/hide password, "forgot password" link, loading and error states. Also reachable as `/login` so links work directly.
- **Sign-up page (`/register`), multi-step:**
  1. Account — username (live availability check), password, optional email
  2. Personal — name, date of birth, contact number
  3. Address — purok/sitio, street, emergency contact name + number
  4. Pregnancy — gravida, para, LMP → EDD auto-calculated (editable)
  5. Review & submit
  - Creates Auth user + `user_account` (MOTHER, ACTIVE) + `mother` (registered_by empty) + ACTIVE `pregnancy` in one step through the sign-up trigger. If any part fails, nothing is created.
- **`/forgot-password` and `/reset-password` pages.**
- After login, each role is redirected to its own (placeholder) dashboard.

Done when: a mother can sign up on a phone, log in, log out, and recover her password; staff log in with seeded accounts.

**Needs from you:** health center address, clinic days and hours, contact number (placeholders until then).

## Phase 2 — App shell + Admin

- Dashboard layout: sidebar (staff), bottom navigation (mothers on mobile), top bar with language switch and profile menu.
- **Admin:**
  - User accounts: list and search, create Health Worker / Admin accounts with `health_worker` profiles, activate or deactivate, reset passwords
  - Activity types: edit names, descriptions and `reminder_days_before`
- **Profile page** for every user: edit own details, change password, add or change recovery email.

## Phase 3 — Mothers & pregnancies (health worker)

- **Mother registry:** search and filter by purok, EDD month, active / delivered.
- **Register a mother at the health center** (`user_id` empty, `registered_by` set), with an optional "create login for her" step later.
- **Mother profile with tabs:** overview, pregnancy (current + history), visits, appointments, SMS log, follow-ups.
- **Pregnancy management:** add past pregnancies (DELIVERED/ENDED with outcome); close the current one with an outcome. Rule enforced: only one ACTIVE pregnancy per mother.
- **Mother portal:** view her own profile, pregnancy summary (AOG, EDD countdown) and history.

## Phase 4 — Appointments

- **Mother:** request an appointment (activity type, preferred date and time) → REQUESTED; see status updates; cancel her own request.
- **Health worker:**
  - Review queue: confirm, reschedule (with a new date and time) or cancel, with remarks
  - Create appointments directly (start as CONFIRMED)
  - Calendar view and list view
- **SMS queue rows** are created here in test mode: an UPCOMING reminder on confirm, replaced on reschedule, removed on cancel.

## Phase 5 — Prenatal visits & services

- **Record a visit:**
  - Vitals (BP, weight, temp, pulse, fundal height, FHR) with range checks to catch typos — no diagnosis
  - AOG auto-calculated from LMP
  - Link to an appointment (it becomes COMPLETED; the appointment must belong to the same pregnancy), or record a walk-in with no appointment
- **Services given:** add services at the visit (e.g. TT2, 30 iron/folic acid tablets, lab test, health education).
- **Next checkup:** a "schedule next checkup" step at the end of the visit creates the next appointment.
- **Mother view:** visit history and simple trend charts (weight, BP) for display only.

## Phase 6 — Missed appointments & follow-ups

- **Nightly job (pg_cron):** CONFIRMED/RESCHEDULED appointments whose time has passed with no visit → MISSED, and a MISSED_NOTICE SMS is queued.
- **Follow-up queue** for staff: log a follow-up (call, SMS or home visit + outcome), several per appointment, and rebook from there.

## Phase 7 — SMS reminders (HTTPSMS)

- **Sender:** a protected route in this app (`/api/cron/send-sms`) sends due PENDING messages through HTTPSMS and saves the result (`sent_at`, `provider_message_id`, errors). Supabase `pg_cron` + `pg_net` call it every few minutes with `CRON_SECRET`. (Vercel's free plan only runs its own scheduled jobs once a day, which is too slow.)
- **Delivery updates:** an HTTPSMS webhook route updates the status to DELIVERED or FAILED.
- **Messages:** bilingual templates under 480 characters; the number is copied from the mother's contact at queue time.
- **Admin SMS log** with filters, retry for failed messages, and a test-mode switch.

**Needs from you:** an Android phone with the HTTPSMS app, plus its API key and phone number added to `.env.local`.

## Phase 8 — Dashboards & reports

- **Staff dashboard:** today's appointments, pending requests, missed needing follow-up, active pregnancies, mothers due within 30 days.
- **Reports** (date range + filters): active pregnancies, completed visits, upcoming and missed appointments, services given, SMS delivery. Print-friendly view + CSV export.
- **Admin dashboard:** account counts and SMS health.

## Phase 9 — Hardening & launch

- **Security:** RLS test per role, input validation, re-check login protection, security review.
- **Quality:** accessibility pass (contrast, keyboard, screen reader), performance pass, testing on real phones.
- **Deploy:** Vercel, environment variables, Supabase backups.
- **Hand-off:** demo seed data for the defense, short user guides per role, and support for the usability / reliability / maintainability evaluation.

---

## Open items

1. `SUPABASE_SECRET_KEY` in `.env.local` (Phase 0).
2. Health center details for the landing page (Phase 1).
3. HTTPSMS phone + API key (Phase 7).
4. Manuscript updates listed on ERD page 2 (scope, named activities, single health center) — outside the code, for you to handle.

Resolved: database inspected (2026-10-26); the first admin gets both ADMIN and health worker profiles; language saved in a cookie; secrets in `.env.local`, no Edge Functions.
