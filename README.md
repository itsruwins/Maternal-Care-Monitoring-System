# Taysan MaternaCare

**Maternal Care Monitoring System with SMS Reminder** for the Brgy. Taysan Health Center, Legazpi City.
Live at **https://taysanmaternacare.vercel.app**.

Mothers sign up, follow their pregnancy week by week, request check-up visits and get SMS reminders. Health workers and the admin keep each mother's record, book and confirm visits, record vital signs, follow up missed visits and print reports. English and Filipino throughout.

**Built with:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres with row-level security, Auth, pg_cron, pg_net, Vault) · httpSMS (texts from an Android phone) · Vercel · Tailwind CSS 4 · Vitest.

## Run it locally

Needs Node.js 20.9 or newer.

```bash
npm install
# create .env.local with the 9 names below (values from the project owner, never committed)
npm run dev        # http://localhost:3000
```

| Variable | What it is | Where it comes from |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | the database address | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public key (safe in the browser; RLS protects the data) | Supabase → API Keys |
| `SUPABASE_SECRET_KEY` | server-only key that bypasses RLS | Supabase → API Keys |
| `NEXT_PUBLIC_SITE_URL` | the live address, for links in emails | `https://taysanmaternacare.vercel.app` |
| `HTTPSMS_API_KEY` | sends texts | httpSMS → Settings |
| `HTTPSMS_FROM_NUMBER` | the sending phone's number, `+639…` | the SMS phone |
| `HTTPSMS_WEBHOOK_SIGNING_KEY` | checks httpSMS delivery reports | a long random string, also in the httpSMS webhook form |
| `CRON_SECRET` | lets the 5-minute job call the sender | a long random string, also in Supabase Vault as `cron_secret` |
| `RATE_LIMIT_SECRET` | key for hashing network addresses in the abuse limits | a long random string |

| Script | Does |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build / run it |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (`tests/unit/`, no database) |

Only one `next dev` per folder at a time. Design previews of every screen (sample data, dev only) are under `/en/design-preview/…`.

## Database

- **Migrations:** `supabase/migrations/0001…0025`, run in order in the Supabase SQL Editor. Order, what each does and the check queries: **[docs/database-setup.md](docs/database-setup.md)**. Migrations are never edited after running; fixes go in a new file.
- **First admin:** `supabase/seed/first-admin.sql`.
- **Access-rule test:** `supabase/tests/rls-by-role.sql` (acts as each role, prints PASS/FAIL, undoes itself). Run it after any change to the rules; expect 118 PASS.
- **Backups and restore:** **[docs/backup.md](docs/backup.md)**, monthly and before every migration.

## Live settings

As set on 2026-11-03. Recheck after any Supabase or Vercel change.

**Supabase → Authentication**
- URL Configuration: Site URL `https://taysanmaternacare.vercel.app/`; Redirect URLs `https://taysanmaternacare.vercel.app/**` and `http://localhost:3000/**`.
- Sign In / Providers: **Allow new users to sign up off** (the app creates accounts itself), **Confirm email off**. Email provider: minimum password length **8**, **no** extra password requirements (default passwords are the username, lowercase letters and numbers).
- Rate Limits: emails **30 per hour**; sign-ups and sign-ins **30 per 5 minutes**; token refreshes 150 per 5 minutes; the rest default.
- Emails → SMTP: **Gmail** from the health center's account (`smtp.gmail.com`, port 587, an App Password). Templates → Reset password: the custom Taysan MaternaCare email (seal, green button, English and Filipino). **It lives only in the dashboard**, so copy it out before retiring a project.

**Supabase → Database**
- Extensions `pg_cron` and `pg_net`.
- Cron jobs: `send-sms` every 5 minutes, `mark-missed-appointments` daily 6:00 PM Manila, `clean-rate-limits` daily 3:00 AM Manila.
- Vault secrets `sms_sender_url` and `cron_secret` (values never in files; see `docs/database-setup.md`).

**Vercel**
- The 9 variables above, set for **Production and Preview**. Pushes to `main` deploy to production. A **preview** (any other branch or pull request) uses the **live database**, so bookings made there are real and can send real texts. Don't push other branches casually.

**httpSMS**
- Webhook to `https://taysanmaternacare.vercel.app/api/webhooks/httpsms` with the same signing key as `HTTPSMS_WEBHOOK_SIGNING_KEY`, for sent, delivered, failed and expired messages and the phone's online/offline heartbeat.

**Quick checks:** in the SQL Editor, `select jobname, schedule, active from cron.job;` and `select name from vault.secrets;`. Then `/admin/sms` shows the phone status and the latest texts.

## Folders

```
src/app/[lang]/   pages, per language (en, fil); api/ for the SMS sender, webhook and CSV export
src/features/     one folder per feature: components, actions, queries, schemas
src/components/   shared UI (ui/ = base components, shared/ = app-wide pieces, icons/)
src/lib/          Supabase clients, auth helpers, validation, dates, SMS text rules
src/i18n/         English and Filipino dictionaries
supabase/         migrations, seed, tests, queries
tests/unit/       Vitest tests
docs/             plan, database setup, backups, image credits
```

## Known limits

- Logins and sign-ups go through the app's server, so Supabase sees one address for everyone. Its limit of 30 per 5 minutes is shared by all users; raise it in Rate Limits if a big group signs up at once. The app's own limits still stop password guessing: 5 failed tries per username, and 20 per network address in 15 minutes.
- A password-reset link works only in the **same browser** where it was asked for, and only within 1 hour.
- Reset emails come from a regular Gmail account, so a first email to a new address may land in **Spam**; the app tells people to check there.
- Supabase free plan: a project with no activity for a week is paused. The 5-minute SMS job keeps it active. There are no automatic backups (see `docs/backup.md`).
- httpSMS free plan: 200 texts a month; the phone must stay on, charged and online.
- The health center's contact number isn't on the landing page yet.

## Docs

- [docs/PLAN.md](docs/PLAN.md): phases, decisions and what was built
- [docs/database-setup.md](docs/database-setup.md): migrations, cron, Vault, check queries
- [docs/backup.md](docs/backup.md): backups, restore test, recovery
- [docs/assets.md](docs/assets.md): images and credits
