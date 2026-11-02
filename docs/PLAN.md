# Maternal Care Monitoring System with SMS Reminder — Build Plan

Barangay Taysan, Legazpi City · Next.js 16 + Supabase · Hosted on Vercel

Status: **Phases 0–7 done (Phase 7 signed off 2026-11-02). Next: Phase 8 — Dashboards & reports.** Each phase ends with a demo and your sign-off before the next starts.

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
| Language | English + Filipino toggle for the app. The choice is saved in a cookie; web addresses stay the same (no `/en` or `/fil`). Built with simple JSON dictionaries (`src/i18n/`), no translation library. SMS texts are in Taglish for everyone (Phase 4, confirmed in Phase 7). |
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

Changed 2026-10-27: the "Balik Card" look (paper card, stamps, handwriting) is replaced by a soft, feminine, app-like style inspired by the **Flo** app. We copy Flo's style, not its assets: Flo's icons, illustrations and baby renders are its property and are not used.

- **Feel:** soft, warm and caring, like a modern health app for mothers. Rounded shapes, gentle curves, roomy spacing, friendly icons. Mobile-first for mothers; clear, efficient tables for staff in the same style.
- **Palette** (from your color scheme, plus one accent):
  - Green `#769382`: accents, icon circles, charts
  - Deep green `~#4F6B5E`: primary buttons and text links (the light green fails contrast on white)
  - Beige `#E8DDC9` (the image label is a typo): warm section backgrounds
  - Sage `#C0C3B9`: borders, muted UI
  - Cream `#F3EFE3`: page background
  - **Dusty rose `~#D9A5A0` (new, small touches only):** hero curve tint, hearts, some icon circles. It is too light for text, so any rose text uses a darker shade that passes contrast.
  - Plus muted status colors: requested, confirmed, completed, missed, cancelled
- **Font:** **Inter** everywhere, like Flo (Archivo and Kalam removed). Weights 400/500/600/700. Sizes follow Flo: 12, 14, **16 body**, 18, 20, 24, 32, 48 px hero; body line height 24 px; big numbers (weeks, days) in bold.
- **Shapes:** cards with 16–20 px corners, pill-shaped buttons, circles for dates and icons, hero sections that end in a soft curve.
- **Icons:** **Phosphor Icons** (`@phosphor-icons/react`), in Flo's three styles:
  1. Navigation: thin rounded outline icons; the selected tab switches to the filled version.
  2. Feature icons: a white or filled icon inside a soft colored circle (green, sage, beige or rose).
  3. Actions: "+" and similar inside a filled circle.
  All icons come from one shared folder, so the same icon always means the same thing (for example: baby = pregnancy, calendar-heart = appointment, syringe = vaccine).
- **A web app, not a mobile app.** It is one responsive website. Desktop and tablet get real web layouts (top menu or sidebar, wider grids). The Flo-style layout applies at phone widths. Nothing suggests an app download (no app-store badges, no "install the app").
- **Signature phone layout** (mother portal, from Flo's pregnancy screen): a week strip at the top with appointment days circled, a curved hero with the fetus picture and "24 weeks, 3 days" in big bold type, then a sideways row of rounded insight cards (next visit, tip of the week, danger signs).
- **Baby picture** (like Flo's "Your baby" icon): a soft baby-in-womb glyph in a rose circle, a little bigger each trimester (weeks 1–13, 14–27, 28–40+). Glyph from Health Icons (MIT), `src/components/icons/fetus-icon.tsx`; component `components/shared/fetus-picture.tsx`. Shown on the mother's Today screen, in the landing hero, and on the staff mother profile. (Realistic 3D renders were tried on 2026-10-27 and dropped as too harsh.)
- **Design files:** `PRODUCT.md` (product facts, kept) and `DESIGN.md` (rewritten for the new style after the build).
- **Logo:** the barangay seal shown small on a neutral circle, next to a clean text wordmark. Its bright colors are not used in the UI palette.
- **Tools:** `/impeccable` to set the design system and review screens, `/apple-design` + `emil-design-eng` for motion and interaction polish.
- **Stack:** Tailwind v4, shadcn/ui (accessible components, restyled), Motion, React Hook Form + Zod (forms), Phosphor icons (Lucide stays only inside shadcn internals), Sonner (toasts), a chart library for reports. Exact versions checked against Next 16 at install time.

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
2. **Features don't reach into each other's internals.** A feature may use another feature's `components/` (e.g. the landing page opens the auth feature's login dialog), but never its `actions`, `queries` or `schemas` directly. Anything else used by two or more features moves to `components/shared` or `lib`.
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
  - `HTTPSMS_API_KEY`, `HTTPSMS_FROM_NUMBER`, `CRON_SECRET`, `HTTPSMS_WEBHOOK_SIGNING_KEY`: Phase 7 (`CRON_SECRET` is also kept in Supabase Vault as `cron_secret`, beside the sender address `sms_sender_url`)
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

**Needs from you:**
- Health center address, clinic days and hours, contact number (shown as "To be announced" until then; edit `src/config/site.ts`).
- Supabase Dashboard → Authentication → URL Configuration: set **Site URL** and add **Redirect URLs** `http://localhost:3000/**` (and the Vercel URL later), so password-reset links work.
- On Vercel later: set `NEXT_PUBLIC_SITE_URL` to the live address.

**Built in Phase 1 (2026-10-26):** visual direction "The Balik Card" (chosen on the decision page); design tokens, Archivo + Kalam fonts, restyled shadcn components (button, input, label, dialog) plus stamp and form field; landing page (hero card with working due-date estimate, how it works, services, records, health center, tips, footer); login dialog + `/login`; 5-step `/register` with live username check and due-date auto-fill; `/forgot-password`, `/auth/callback`, `/reset-password`. Stock photos and credits: `docs/assets.md`.

**Known limits:**
- Logins and sign-ups go through our server, so Supabase's per-address rate limit counts all users together. If the health center signs up many mothers at once, raise it in Supabase → Authentication → Rate Limits.
- Supabase's built-in email sender only allows a few emails per hour. For real use, connect an email provider (Supabase → Authentication → SMTP).
- A reset link must be opened in the same browser where it was requested.

## Phase 1R — Redesign (Flo-inspired)

Only the look changes. Login, sign-up, password recovery, language switch, database and folder structure stay exactly as built in Phase 1.

1. **Style base:**
   - Install `@phosphor-icons/react` and load Inter through `next/font`.
   - Remove Archivo, Kalam and the Balik Card styles (paper grain, stamps, folder cards, handwriting).
   - New tokens in `globals.css`: palette with dusty rose, radius, soft shadows, Inter type scale.
   - Restyle the shadcn parts (button as a pill, input, label, dialog) and add shared pieces in `src/components/ui/`: icon circle, week strip, insight card, curved hero.
   - **Checkpoint:** a short preview of colors, type and icons for your approval before the pages are built.
2. **Landing page (new layout):**
   - Header: seal + name, language switch, Log in, Sign up (pill).
   - Hero: curved soft-tint background, big extra-bold Inter headline, a **"How far along are you?" weeks slider** (4–42 weeks, −/+ buttons, trimester labels; shows the trimester and an estimated due month; replaced the last-period date box on 2026-10-27 because picking a date was a hassle), one Sign up button below it (Log in stays in the header), and the line "Works in your phone's browser, no app to install".
   - Hero picture (changed 2026-10-27, replacing the phone mock-up): a soft illustration of a pregnant mother holding her belly ([Pixabay](https://pixabay.com/vectors/woman-pregnant-mother-mom-sofa-8524046/), free, no credit needed) in a rose arch, with a gently glowing baby glyph on her belly. Floating cards: her weeks with the baby picture (updates live from the weeks slider), the SMS reminder and the next visit on desktop; phones and tablets show only the weeks card so nothing covers her face or the baby.
   - Quick facts row (no email needed, any phone browser, English and Filipino, private to you).
   - How it works: 4 steps on a timeline, beside a sample SMS thread (greeting, appointment card, closing, "works on any phone" facts, floating "New reminder" badge).
   - Services: the 5 activity types as soft tiles with icon circles, top-aligned.
   - Your records: the mother photo beside a sample "My visits" list.
   - Health center: Mayon photo with address, clinic hours and contact (contact still to be announced).
   - Tips: "Healthy habits" and danger signs as two matching cards (same header height, one-column lists with icons).
   - Closing call to action and a full footer (brand, section links, health center details, account actions, privacy and credits).
3. **Auth pages:** the login dialog, `/login`, the 5-step `/register` (stepper becomes rounded steps with icons), `/forgot-password` and `/reset-password` move to the new style.
   - **Done 2026-10-27 (partly):** Log in and Sign up now open in **one shared dialog** on the landing page (bottom sheet on phones); "No account yet? Sign up" / "Already have an account? Log in" switch inside it. Login has a welcome header, icons in the fields and a soft error box. Sign-up keeps its 5 steps with a new icon stepper, field icons, a review step in cards and a Back/Next bar that stays visible while scrolling. `/login` and `/register` stay for direct links, in the new card style. Still to restyle: the forgot/reset password forms.
4. **Review:** desktop + phone screenshots, accessibility contrast check, design review, then `DESIGN.md` rewritten for the new style.

Done when: the landing page and all auth pages use the new style on phone and desktop, everything from Phase 1 still works, and you approve the look.

**Step 1 built (2026-10-27):** Phosphor 2.1.10 installed; Inter replaces Archivo; new tokens (milk, leaf, mint, rose, blush, rose deep, soft shadows, 8–36px radius, Inter scale, float animation, soft slider); pill buttons, rounded inputs, dialog as a bottom sheet on phones; shared icon set `src/components/icons/` (plus the Health Icons fetus glyph); new `icon-circle`, `input-icon`, `week-strip`, `insight-card`, `curved-hero`. Dev-only preview at `/design-preview`.

**Step 2 built (2026-10-27):** the landing page as listed above, after several rounds of your feedback (phone mock-up → 3D renders → soft illustration; date box → weeks slider; bolder titles; alignment fixes). English and Filipino text updated.

**Step 3 built (2026-10-27):** shared Log in / Sign up dialog; new-style `/login`, `/register`, `/forgot-password`, `/reset-password`; dashboard placeholders, user badge and log-out button restyled. Cleanup: the old card style is fully removed (Kalam font, stamps, folder cards, legacy colour names and classes), `lucide-react` uninstalled (all icons are Phosphor; shadcn set to Phosphor too).

**Step 4 done (2026-10-27):** review screenshots in `.impeccable/review/`; contrast checked (hero gradient end lightened so secondary text stays ≥4.5:1); independent design review returned 8 fixes, all applied and confirmed (arch top, baby glyph colours, Sample labels on hero cards, one tint rule for service tiles, no duplicate step names, no fake sheet handle, no stray last-line words); `DESIGN.md` + `.impeccable/design.json` rewritten for the new style ("The Gentle Checkup"). Small follow-ups also fixed: −/+ use icons, dialog close button 44px, slider handle the same size in Firefox.

**After this phase**, the Phase 1 testing checklist (log in, sign up, password reset) is done once, on the new design.

## Phase 2 — App shell + Admin

**Decisions (asked 2026-10-27):**

| Topic | Decision |
|---|---|
| New staff accounts | Admin enters the username, name, position and contact. The **default password is the username**; at first login the person must set their own password before doing anything else. |
| Usernames | **At least 8 characters for everyone** (staff and mothers), so the username is always a valid default password. Existing shorter usernames keep working. |
| Password resets | Admin (any account) and health workers (mothers only; button in Phase 3) reset a password **back to the username**, which forces a change at the next login. |
| Position | Fixed list: Midwife, Nurse, Barangay Health Worker (BHW), Barangay Nutrition Scholar (BNS), Admin staff, Other (type it). |
| Admin navigation | **One staff app.** Admins see an extra "Admin" group (Accounts, Activity types) in the same sidebar. |
| Activity types | Admin can **edit** (name, description, reminder days) and **add**. No delete (old appointments and visits point to them). |
| Mother tabs | **Home, Appointments, Visits, Profile.** SMS reminders show inside each appointment. |

**Database (migration `0007_phase2.sql`, run by you):**
- Username rule raised to 8–30 characters for new or renamed accounts (existing rows are not re-checked).
- Health workers may update their **own** name and contact number (today only admins can). Position stays admin-only.
- "Must change password" is stored in the login's protected settings (Supabase `app_metadata`), so no new column is needed.

**Build, in steps (each ends with screenshots for you):**
1. **App shell:**
   - Staff: sidebar on desktop and tablet (Home, then later Mothers, Appointments, Visits, Follow-ups, Reports; Admin group for admins), a menu button opening the sidebar as a sheet on phones, and a top bar (page title, language switch, profile menu with Profile and Log out).
   - Mothers: a **floating bottom navigation** on every screen size (white pill, outline icons, the selected tab filled on a mint pill); slim top bar with brand, language and profile menu. (Changed 2026-10-27 from a desktop top menu, at your request.)
   - Placeholder pages for links whose phase hasn't come yet ("Coming in Phase N").
   - Admins are sent to the staff home; `/admin/...` holds the admin tools.
2. **First-login password change:** a forced "Set your new password" screen. It blocks every other page until done, and also applies after a reset.
3. **Admin, Accounts:**
   - A list of all accounts with search, filter by role and status, and paging.
   - **Create staff account** (Health Worker or Admin) with a `health_worker` profile.
   - Activate or deactivate (never yourself), reset password (back to the username), and edit a staff member's profile and position.
4. **Admin, Activity types:** list, edit (name, description, reminder days before, from 0 to 30) and add.
5. **Profile page (everyone):**
   - Edit your own details: mothers edit name, contact and address; staff edit name and contact.
   - Change your password.
   - Add or change your recovery email. People without an email can add one, so they can recover a password themselves.
6. **Review:** phone and desktop screenshots, accessibility checks, design review, then your testing.

Every create, update and reset runs on the server and checks the role first. Staff accounts are created with the secret key on the server, never in the browser.

**Needs from you:** run `0007_phase2.sql` (it also renames the first admin login to **`taysan.admin`**; the password stays the same).

**Step 1 built (2026-10-27):** migration `0007_phase2.sql`; username rule 8–30 in the app (sign-up hint and error updated); staff shell (sidebar from 1024px, menu sheet below, top bar with section title, EN/FIL and profile menu; Admin group for admins); mother shell (floating bottom navigation on all screen sizes); welcome home pages; "Coming in Phase N" pages for later sections; admins now land on `/staff`. Dev-only previews: `/design-preview/staff-shell`, `/design-preview/mother-shell`. Feature folder `src/features/shell/`.

**Steps 2–5 built (2026-10-27):**
- **First-login password:** the flag lives in `app_metadata.must_change_password`; the proxy and `requireRole` send flagged users to `/change-password`; login goes there directly; the new password can't equal the username; the flag is cleared and the session refreshed afterwards.
- **Accounts** (`/admin/accounts`): search (name or username), role and status filters, 20 per page, table on desktop and cards on phones. **New staff account** dialog (Health worker / Admin, username = temporary password, name, position list + Other, mobile, optional email); creating it undoes itself if any part fails. Account page: login & security (created, last login, recovery email, "waiting for first password change"), **Reset password** (back to the username, plus forced change, clears login lockout) and **Activate / Deactivate** with confirmations (never your own account), and the staff profile editor. Shared reset helper `lib/auth/reset-to-default.ts` for Phase 3 (health workers resetting mothers).
- **Activity types** (`/admin/activity-types`): cards with an icon, description and reminder timing; add/edit dialog (name, description, 0–30 days); no delete.
- **Profile** (`/staff/profile`, `/mother/profile`): your details (staff: name and mobile, position read-only; mothers: name, mobile, address, emergency contact), change password (current password checked first), and add or change your recovery email.
- Shared rules moved to `lib/validation/account-rules.ts`; new UI pieces `native-select`, `sheet`, `dropdown-menu`. Production build passes.

**Step 6 done (2026-10-27):** you tested manually. Desktop and phone screenshots of every Phase 2 screen were reviewed (not kept in the repo). The independent design review returned 8 fixes; all were applied and confirmed in a second pass (verdict "ship"):
- Small text sizes no longer get lost when combined with a colour (`lib/utils/cn.ts`).
- Table heads and the "Admin" label are in sentence case.
- Staff accounts show a person icon.
- Form buttons are full width on phones.
- Position spans the full form width.
- "Log out" is on the change-password page.
- The mother top bar has a compact brand at phone width, and the bottom-nav labels use the caption size.
- Reset password is an outline button.

`DESIGN.md` was updated with the shell and admin patterns.

## Phase 3 — Mothers & pregnancies (health worker)

- **Mother registry:** search and filter by purok, EDD month, active / delivered.
- **Register a mother at the health center** (`user_id` empty, `registered_by` set), with an optional "create login for her" step later.
- **Mother profile with tabs:** overview, pregnancy (current + history), visits, appointments, SMS log, follow-ups.
- **Pregnancy management:** add past pregnancies (DELIVERED/ENDED with outcome); close the current one with an outcome. Rule enforced: only one ACTIVE pregnancy per mother.
- **Mother portal:** view her own profile, pregnancy summary (AOG, EDD countdown) and history. The home ("Today") screen follows the Flo pregnancy screen: week strip with appointment days, curved hero with the trimester's 3D fetus picture and weeks pregnant, insight cards (next visit, tip of the week, danger signs). On desktop the same content sits in a wider two-column layout.
- **Staff mother profile:** a small trimester fetus picture beside AOG and EDD on the pregnancy tab.

**Decisions (asked 2026-10-27):**

| Topic | Decision |
|---|---|
| Purok list | No official list was found online (a 2014 study only says Taysan has 10 puroks). An **admin-managed list** starts as Purok 1 to Purok 10. Admins can rename, add or hide puroks. Sign-up, registration and the registry filter all use it. |
| EDD | **From the LMP** (LMP + 280 days), filled in automatically and editable (e.g. to match an ultrasound). Same as sign-up. |
| Login for mothers registered at the center | **Optional "Create a login for her" checkbox** on the form: username = temporary password, forced change at first login. It can also be added later from her profile. |
| Fetus picture | Flo-style soft, warm 3D look, **AI-generated** (one per trimester). You approve them before they go in. Flo's own art is not used. |
| Gravida / para | **Entered by the health worker**, as on the paper record (past pregnancies are often not in the system). |
| Who edits mothers | **Any health worker or admin** can update any mother and her pregnancies. The record keeps who registered her. |

**Database (migration `0008_phase3.sql`, run by you):**
- New `purok` table (name, order, shown/hidden), starting with Purok 1–10. Everyone can read shown puroks (sign-up needs them), and only admins change them.
- `mother.purok_id` points to the list. Existing mothers are matched from their typed purok where the text clearly says a number (e.g. "Purok 3", "Prk. 3"). The rest are listed for a health worker to fix. The old text column stays but is no longer shown.
- The sign-up step saves the chosen purok.
- The access rules for health workers registering and updating mothers and pregnancies get checked and fixed where needed.

**Build, in steps (each ends with screenshots for you):**
1. **Database + puroks:** migration `0008`. Admin **Puroks** page (list, add, rename, hide). The sign-up address step uses a purok dropdown.
2. **Mother registry** (`/staff/mothers`):
   - Search by name or contact number.
   - Filter by purok, EDD month and status (active pregnancy, delivered or ended, none).
   - 20 per page; table on desktop, cards on phones.
3. **Register a mother at the health center:**
   - Personal and address details, plus the current pregnancy: gravida, para, LMP → EDD (editable).
   - Optional "Create a login for her" (username, plus an optional email).
4. **Staff mother profile** (`/staff/mothers/[id]`):
   - **Overview:** details (editable), emergency contact, who registered her and when.
   - **Pregnancy:**
     - The current pregnancy with weeks pregnant (AOG), EDD countdown and the trimester picture.
     - Edit it, or close it with an outcome (live birth, stillbirth, miscarriage, other) and a date.
     - Start a new one (only when none is active).
     - Add past pregnancies.
   - **Login:** create a login later; reset her password back to her username; activate or deactivate.
   - **Visits, Appointments, SMS log, Follow-ups:** "Coming in Phase N" until those phases.
5. **Fetus pictures:** three AI-generated images (1st, 2nd and 3rd trimester). You approve them, then they go in.
6. **Mother portal home ("Today"):**
   - A week strip.
   - A soft curved hero with the trimester picture, "Week N" and the days until her EDD.
   - Insight cards: next visit (empty until Phase 4), tip of the week, danger signs.
   - Her pregnancy history.
   - Two columns on desktop. If she has no active pregnancy, a calm message with the health center's contact details.
7. **Review:** phone and desktop screenshots, accessibility checks, design review, then your testing.

**Step 1 built (2026-10-27):** migration `0008_phase3.sql` (already run). Shown puroks are read from a shared cached lookup (`lib/puroks`), which is refreshed as soon as an admin changes a purok. The admin **Puroks** page (`/admin/puroks`) can add, rename, hide and show puroks; there is no delete. Sign-up (step 3) and the mother's own profile now use a purok dropdown. The admin account page shows the purok name. Database types gained the purok table and join info. Dev preview: `/design-preview/puroks`.

**Step 2 built (2026-10-27):** mother registry at `/staff/mothers` (health workers and admins).
- **Search:** every word must match a name part or the mobile number.
- **Filters:** purok (including "No purok yet", for mothers whose old typed purok couldn't be matched), due month (last month to 10 months ahead) and pregnancy ("Pregnant now" / "Not pregnant now"). The plan's three statuses became two, because every mother is registered with a pregnancy.
- **Rows:** weeks pregnant (and trimester) from the LMP, or from the EDD when the LMP is unknown, counted in Manila time. Closed pregnancies show the last outcome and date. Each row also shows whether she can log in.
- **Layout:** 20 per page; table from 768px, cards on phones. Paging is shared with the Accounts list (`components/shared/pager.tsx`).
- Rows open her record (step 4). Dev preview: `/design-preview/mothers`.

**Step 3 built (2026-10-27):** "Register a mother" on the registry opens `/staff/mothers/new`. The form has four cards (about her, address and emergency contact, current pregnancy, optional login).
- **Due date:** fills in from the LMP until someone edits it.
- **Duplicates:** a mother with the same name and date of birth is refused (she may have signed up on the website already).
- **Login:** ticking "Create a login for her" makes a login with username = temporary password and a forced change at first login. The shared helper `features/mothers/server/mother-login.ts` will be reused by step 4's "Create login".
- **Undo:** if a later step fails, the earlier ones are undone (login, then record), so nothing half-made is left.
- **Kept input:** the form submits without React's automatic reset, so a mistake doesn't clear what was typed.
- **Done screen:** shows who was registered and her temporary password, with "Register another".
- Date and number rules shared with sign-up moved to `lib/validation/mother-rules.ts`. Dev preview: `/design-preview/register-mother`.

**Form fix (2026-10-27):** React 19 cleared a form's fields every time it was submitted, even when the server only returned "fix this field". All 13 forms now use `lib/forms/submit-without-reset.ts`. The `action` prop stays, so a submit before the page has loaded is blocked instead of putting the fields in the address. Checked on the login page: the username stays after an error.

**Step 4 built (2026-10-27):** a mother's record at `/staff/mothers/[id]`, opened from the registry rows or the registration done screen.
- **Header:** name, age, mobile, purok, pregnancy chip, login status, and who registered her (or "signed up on the website").
- **Tabs** are plain links (`?tab=`).
- **Overview:** her editable details, plus a Login card: create a login (shared helper from step 3), or see her username, status, last login and email, with Reset password (back to her username) and Activate / Deactivate behind confirmations. These act only on the login linked to that mother record.
- **Pregnancy:** the current pregnancy shows the trimester picture placeholder (step 5 replaces it), week, trimester, days to go (or overdue), due date, LMP and G/P, with Edit and Close (outcome, date, remarks; births become DELIVERED, the rest ENDED). Without one, "Start a new pregnancy". Past pregnancies can be added and edited (G/P as they were then; the outcome date can't be before the LMP or in the future, in Manila time).
- **Appointments, Visits, Follow-ups, SMS log:** say which phase brings them.
- Dev preview: `/design-preview/mother-record` (`?tab=pregnancy`, `?login=none`, `?current=none`).

**Step 5 done (2026-10-27):** you generated the three pictures from my prompts (originals in `Files/`). All three are cropped with the same 1100px window, so the baby visibly grows, and saved as 640px WebP (`public/fetus/trimester-1/2/3.webp`, 5–8 KB each). `TrimesterPicture` shows them in a circle (decorative; the week and trimester are always written beside it). Used on the staff Pregnancy tab now, and on the mother home in step 6. Credits in `docs/assets.md`. Dev preview: `/design-preview/mother-record?tab=pregnancy&lmp=YYYY-MM-DD` to see each trimester.

**Step 6 built (2026-10-27):** the mother home (`/mother`, feature `features/mother-home`) is the "Today" screen.
- **Top:** today's date and "Hello, {name}".
- **Hero:** a rose curved panel with this week's strip (today marked; appointment days in Phase 4), the large trimester picture, "Week N", trimester and exact weeks and days, days to go (or past due), due date, and whether it was counted from the LMP or the due date.
- **Insight cards:** Next visit (links to Appointments; "None booked yet" until Phase 4), Tip of the week (jumps to the tip; 12 general tips picked by week) and Danger signs (jumps to the list).
- **Below:** the tip, danger signs (with what to do) and her past pregnancies.
- **Layout:** two columns from 1024px, with the hero kept in view while scrolling.
- **No active pregnancy:** a calm message with the health center's address, hours and contact (still "To be announced"), plus history and danger signs.
- The placeholder check moved to `config/site.ts` (shared with the landing page). Dev preview: `/design-preview/mother-today` (`?lmp=`, `?none=1`).

**Step 7 review (2026-10-27):**
- **Checks:** production build passes; typecheck and lint pass.
- **Contrast:** every new text/background pair is at least 4.5:1 (lowest: secondary text at the bottom of the rose hero, 4.67:1).
- **Design review:** returned 5 fixes, all applied and confirmed in a second pass (verdict "ship"):
  - the "Current pregnancy" card has a real section header, with Edit and Close beside it;
  - health-center facts put the label above the value on phones, and the clinic hours no longer break after the dash;
  - registry filters fold behind a "Filters" button on phones;
  - the Today tip and danger cards say something;
  - staff screens use one outcome wording (Live birth / Stillbirth / Miscarriage / Other).
- **Extras:** only hidden puroks carry a badge; the danger card gets a call link once the health center number is set.
- **Filipino:** shorter card labels and "Appointment" in the nav so nothing wraps.
- **Docs:** `DESIGN.md` + `.impeccable/design.json` updated for the Phase 3 screens and the trimester pictures. Review screenshots deleted (not kept in the repo).
- **Still needed:** your testing.

## Phase 4 — Appointments

- **Mother:** request an appointment (activity type, preferred date and time) → REQUESTED; see status updates; cancel her own request.
- **Health worker:**
  - Review queue: confirm, reschedule (with a new date and time) or cancel, with remarks
  - Create appointments directly (start as CONFIRMED)
  - Calendar view and list view
- **SMS queue rows** are created here in test mode: an UPCOMING reminder on confirm, replaced on reschedule, removed on cancel.

**Decisions (asked 2026-10-27):**

| Topic | Decision |
|---|---|
| Time slots | **Exact times, 30 minutes each**, Monday to Friday: 8:00–11:30 and 1:00–2:30 (lunch 12–1 stays free), so **12 slots a day**. |
| One per slot | **A date and time can hold only one appointment, whatever the service.** No daily limit beyond the open slots. |
| Requests hold slots | **First come, first served.** A waiting request already holds its slot; cancelling frees it. |
| Booking window (mothers) | **From tomorrow, up to 3 months ahead.** Staff can book any open slot, including today. |
| New time from staff | Picking a different time, for a request or a confirmed visit, is a **proposed new time (RESCHEDULED)**. **The mother must accept it** (it becomes CONFIRMED) or decline it (it is **cancelled**). Mothers without a login can't answer in the app, so for them a new time is confirmed directly (staff arranged it by phone). |
| Mother cancelling | Her **requests any time**, and **confirmed visits until the day before** (11:59 PM). On the day itself she contacts the health center. |
| Closed days | **Admins mark closed dates** with a reason (holidays, trainings). Nobody can request or book them; existing bookings on a newly closed day are flagged for staff. |
| SMS reminders | **Taglish**, one message for everyone, kept short. Sent at **8:00 AM, N days before** (N = the activity type's "reminder days before"; 0 = the same morning). Phase 4 only queues them; sending starts in Phase 7. |

Sample reminder (about 140 characters, one SMS):
> Hi Ana! Paalala: Prenatal Checkup mo sa Thu, Nov 5, 9:00 AM sa Taysan Health Center. Dalhin ang booklet mo. Salamat! -Taysan MaternaCare

**Database (migration `0009_phase4.sql`, run by you):**
- `closed_day` table (date, reason): everyone logged in can read it; admins manage it.
- **Slot rules**, checked by the database whenever a time is set or changed: on a 30-minute slot, Monday to Friday, inside 8–12 or 1–3 (Manila time), not on a closed day. For mothers, also from tomorrow up to 3 months ahead.
- **One appointment per slot:** a unique rule on the slot an appointment holds (its scheduled time, or its requested time while waiting), for everything except cancelled ones.
- **Mother actions** as safe database functions: cancel (requests any time; confirmed visits until the day before), accept or decline a proposed time.
- **`taken_slots(from, to)`**: lets mothers see which slots are taken, without seeing whose they are.
- **SMS queue kept in step automatically:** confirming (or accepting a new time) queues the reminder, replacing any earlier one that hasn't been sent; cancelling or proposing a new time removes it.

**Build, in steps (each ends with screenshots for you):**
1. **Database:** migration `0009` and the matching app types.
2. **Admin, Closed days:** list, add (date and reason), remove a future one.
3. **Mother, Appointments page:**
   - **Request a visit:** choose the service, then a date (weekends, closed days and full days greyed out), then an open time; add an optional note.
   - **Her list:** upcoming (waiting, confirmed, or "new time proposed" with Accept / Decline) and past.
   - Cancel within the rules.
   - The Today screen's week strip and "Next visit" card now show her appointments.
4. **Staff, Appointments:**
   - **Review queue:** waiting requests, with Confirm as requested, Propose another time or Cancel (with remarks).
   - **Book an appointment** directly for a mother with a current pregnancy (it starts CONFIRMED).
   - **List view** (filters: status, service, date range) and **calendar view** (month, with a count on each day; the day's appointments beside it).
   - The mother record's **Appointments tab** shows her appointments, with Book.
   - Each appointment shows its reminder status (e.g. "Reminder queued for Nov 4, 8:00 AM").
5. **Review:** phone and desktop screenshots, accessibility checks, design review, then your testing.

**Step 1 done (2026-10-27):** migration `0009_phase4.sql` written and run by you. The app types now include `closed_day`, the new functions (`taken_slots`, `respond_to_new_time`, `slot_problem`) and the appointment / SMS reminder links.

**Step 2 built (2026-10-27):** Admin → **Closed days** (`/admin/closed-days`, feature `features/closed-days`).
- **Upcoming list:** long dates and reasons. A rose warning shows when appointments are still booked on a closed day.
- **Recent past:** the last 10 closed days, shown quietly.
- **Add:** date (today or later; weekends refused, since they're always closed) and reason.
- **Remove:** future days only.
- Dev preview: `/design-preview/closed-days`.

**Step 3 built (2026-10-27):** mother appointments (feature `features/mother-appointments`; shared slot rules and formatting in `lib/appointments/`).
- **`/mother/appointments`:**
  - Proposals come first, in a blush card with the new time, what she asked for, and Accept / Decline (decline asks for confirmation, then cancels).
  - Then Upcoming: a date tile, service, day and time, a status chip, her note, and Cancel. Requests can be cancelled any time; confirmed visits until the day before, otherwise "contact the health center".
  - Then Past.
  - Without a current pregnancy there's no Request button, only a short explanation.
- **`/mother/appointments/new`:**
  - Choose the service (option cards), a day on a month calendar (weekends, closed days, full days and dates outside tomorrow…3 months can't be picked), then an open time (taken times are shown crossed out).
  - An optional note, then a summary line before sending.
  - If someone takes the time first, she's told and the times refresh.
- **Today screen:** the week strip marks her visit days (booked, waiting, done, missed), and "Next visit" shows the next confirmed (or else waiting) visit.
- Database error codes map to friendly messages (`appointmentErrors`).
- Dev previews: `/design-preview/mother-appointments`, `/design-preview/request-visit`, `/design-preview/mother-today`.

**Step 4 built (2026-10-27):** staff appointments (feature `features/appointments`). The calendar and time picker became one shared `components/shared/slot-picker.tsx` (mothers' request form, staff booking and "Other time" all use it).
- **`/staff/appointments`** has three link-tab views (the Requests tab shows a red count):
  - **Requests** (oldest first): **Confirm** (at the time she asked for), **Other time** (shared slot picker; she must accept, or it's confirmed right away if she has no login) and **Cancel** (optional reason), with remarks added under her note.
  - **List:** filters for status, service, from and to; table from 1024px with the actions on one line, cards below; 20 per page (pages follow the requested time).
  - **Calendar:** a month grid with booked counts and closed days, and the chosen day's appointments beside it.
- **Each appointment** shows her name (links to her record), the service, a status chip ("New time sent" while she decides), her note and remarks, and the reminder line ("Reminder queued for Wed, Nov 4 · 8:00 AM", sent or failed).
- **`/staff/appointments/new`:** find a mother with a current pregnancy (search by name or mobile, or `?mother=ID` from her record), then service, day (today up to 6 months ahead) and time, then remarks. It starts CONFIRMED and opens her record's Appointments tab.
- **Mother record → Appointments tab:** Book, open appointments with actions, then past ones. The record page takes the panel as a slot, so the two features stay separate.
- Dev previews: `/design-preview/staff-appointments` (`?view=list|calendar`), `/design-preview/book-appointment`, `/design-preview/mother-record?tab=appointments`.

**Request flow redesign (2026-10-27, at your request, after step 4):**
- **Decisions:**
  - Flo-style service art made in code: a filled Phosphor icon on a pastel blob, with leaf, plus and sparkle accents (`components/shared/service-art.tsx`).
  - Admins pick each service's icon from 12 choices (migration `0010_service_icons.sql`, run by you; the Activity types dialog has the picker).
  - Tiles show the name only.
  - The day and time appear on the same page after a service is picked.
  - A day strip, with "See full month".
  - A summary bar to send.
  - Staff screens share the new look.
- **Mother request:** the service tiles come first (2 per row on phones). The chosen one folds into a chip with Change. Then "Choose a day" (sideways weekday cards with "12 open", "Full" or "Closed", plus a polished month view where open days have a dot) and "Choose a time" (Morning / Afternoon groups). A summary bar above the bottom navigation shows the day and time, the service, "Add a note" and **Send request**.
- **Staff:** booking uses the compact service tiles and the same day strip; "Other time" uses the day strip too. Activity types cards show the service art.
- **People illustrations (your request):** the big service tiles (mother request, staff booking) show 12 flat illustrations you generated from my prompts (originals in `Files/Services/`, web copies in `public/services/`, 146 KB total, all with the same crop window). One matches each icon key, so whatever icon an admin picks also picks the tile picture. Small spots (the chosen-service chip, summary bar, Activity types cards and the admin picker) keep the icon art.
- **More services (your request):** migration `0011_more_services.sql` adds Nutrition Counseling, Prenatal Dental Checkup, Fetal Heartbeat Check and Birth Plan Counseling (1-day reminder; they use the nutrition, dental, heartbeat and counseling pictures). That makes 9 services. Postpartum and newborn services are left out: appointments need a current pregnancy, and the MVP excludes newborn care.
- **Mother bottom navigation (your request):** a snug pill that is only as wide as its buttons. Tabs show only their icon; the current tab opens into a mint pill with its icon and name. When she switches tabs, the name slides open (its grid column eases from 0fr to 1fr over 420 ms with the padding and colour), and it switches off for "reduce motion". Previews pass `previewPath` to mark the current tab.

**Step 5 review (2026-10-27):**
- **Checks:** production build, typecheck and lint pass.
- **Contrast:** readable text is at least 6:1. The faded text appears only on days and times that can't be picked, and each one is also named for screen readers ("Full", "Closed", "taken").
- **Design review:** returned 4 fixes, all applied and confirmed in a second pass (verdict "ship"):
  - the "Offer another time" dialog overflowed and hid its Send button; fixed in the shared dialog (`grid-cols-[minmax(0,1fr)]`), so no dialog can be widened by its content;
  - day-strip cards keep weekday, date and status, with a month label between cards and the header following the first visible day;
  - strip status text is 12px with wider cards (the Filipino "12 bakante" fits);
  - the admin picture picker shows the real illustrations.
- **Extras:**
  - the month view opens on the first month with an open day;
  - the proposal panel's inner card has a 12px radius;
  - the Activity types reminder bell uses the regular weight;
  - the Filipino "See full month" is now "Buong buwan".
- **Docs:** `DESIGN.md` + sidecar updated for Phase 4. Review screenshots deleted (not kept in the repo).
- **Still needed:** your testing. Run migrations `0010` and `0011` first if you haven't.
- **Laboratory Test removed (your request, 2026-10-29):** migration `0012_remove_laboratory_test.sql` deletes it only if nothing uses it, otherwise it stops and deletes nothing. It stopped: 1 test appointment used it. You chose to delete that too, so migration `0013_delete_laboratory_test.sql` deletes the service with its appointments and their SMS reminders (it refuses if a recorded visit used it). That leaves 8 services. The landing page's services section now lists the same 8 (two rows of four).

## Phase 5 — Prenatal visits & services

- **Record a visit:**
  - Vitals (BP, weight, temp, pulse, fundal height, FHR) with range checks to catch typos — no diagnosis
  - AOG auto-calculated from LMP
  - Link to an appointment (it becomes COMPLETED; the appointment must belong to the same pregnancy), or record a walk-in with no appointment
- **Services given:** add services at the visit (e.g. TT2, 30 iron/folic acid tablets, lab test, health education).
- **Next checkup:** a "schedule next checkup" step at the end of the visit creates the next appointment.
- **Mother view:** visit history and simple trend charts (weight, BP) for display only.

**Decisions (asked 2026-10-30):**

| Topic | Decision |
|---|---|
| Vitals | **As the database has them:** BP, weight, temperature and pulse are required; fundal height and fetal heart rate are optional. |
| Range checks | **Impossible values are blocked as typos** (e.g. BP 15, weight 900). **Unusual but possible values** get a gentle "Please double-check this value" note and can still be saved. No diagnosis or medical advice anywhere. |
| Starting a visit | A **Visits page** shows today's confirmed appointments, each with **Record visit**, plus **Walk-in visit** (find any mother with a current pregnancy). Record visit also appears on the appointment card and on her record. |
| Editing | **Same day, any health worker** (to fix typos); after that day, admins only. |
| Services given | **Service + details** (e.g. "TT2", "30 tablets", "Topic: breastfeeding") with optional result notes. The appointment's own service is added already. |
| Next checkup | An **optional "Book next checkup" step** after saving: the same service tiles and day strip, with a suggested date (about every 4 weeks; every 2 weeks from week 28; weekly from week 36). It books a CONFIRMED appointment and queues the SMS. It can be skipped. |
| Mother view | **History + 2 charts:** her past visits (date, week, BP, weight, services), each with its details; simple weight and BP charts (display only); her next checkup on top. |
| Missed appointments | **Phase 6.** Until then, a past appointment with no visit simply stays Confirmed. |

**Build, in steps (each ends with screenshots for you):**
1. **Database (migration `0014_phase5.sql`, run by you):**
   - The AOG is worked out from the pregnancy (LMP, or the EDD when the LMP is unknown).
   - A visit linked to an appointment marks it COMPLETED (it must be the same pregnancy, and not cancelled).
   - Health workers can only edit a visit on its own day (Manila); admins can edit any time.
   - The visit and its services are saved together.
2. **Staff Visits page and Record visit:**
   - Today's appointments, Walk-in, and recent visits.
   - The visit form: vitals with typo blocks and double-check notes, services given with details, notes.
   - The optional Book next checkup step.
3. **Mother record → Visits tab** (her visits, each opening its details; edit on the same day), and **visit details**.
4. **Mother → Visits page:** history, next checkup, weight and BP charts.
5. **Review:** screenshots, accessibility checks, design review, then your testing.

**Step 1 written (2026-10-30):** migration `0014_phase5.sql`.
- **Typo limits:** BP 60–250 over 30–150 (top number above bottom), weight 30–200 kg, temperature 34–42 °C, pulse 40–200, fundal height 5–50 cm, baby's heartbeat 80–220.
- **Every visit:** needs a current pregnancy; its AOG comes from the LMP (or EDD − 280); it is recorded by the logged-in staff member.
- **Appointment link:** only an open appointment (Confirmed, New time sent or Missed) can be linked, and it becomes COMPLETED.
- **Locked fields:** the pregnancy, appointment, recorder and time can't be changed later.
- **Edit window:** the same Manila day for health workers; admins any time (also for services given).
- **Saving:** `record_visit()` / `update_visit()` save a visit with its services in one step.
- Visits are recorded with the current time (backfilling old paper records is not part of Phase 5). App types updated.

**Step 2 built (2026-10-30):** feature `features/visits`; shared vital-sign rules in `lib/visits/vitals.ts`.
- **`/staff/visits`:** today's appointments (time tile, mother, service, **Record visit**, or "Visit recorded" once done), **Walk-in visit**, and the 20 latest visits (week, BP, weight, number of services).
- **`/staff/visits/new`:** from an appointment (`?appointment=`), or a walk-in (search by name or mobile, then `?mother=`). A walk-in who has an open appointment today gets it linked.
- **The form:**
  - **Vital signs:** big number fields with units; BP as top / bottom. Typos are blocked with the same limits as the database. The first save with unusual values marks each one "Please double-check this value"; saving again keeps them. The last visit's weight is shown.
  - **Services given:** tap chips (the appointment's service is picked already), each with details and optional result notes.
  - **Visit notes.**
  - Everything is saved in one step (`record_visit`).
- **After saving:** `/staff/visits/[id]/next` shows "Visit saved" and **Book her next checkup?** (the booking form starts with Prenatal Checkup and the first open weekday after the usual interval) or **Skip for now** (her record).
- **Appointments:** today's Confirmed / New-time-sent appointments show **Record visit** on their cards (queue, list, calendar day and record tab).
- New `components/ui/textarea.tsx`. Dev previews: `/design-preview/visits`, `/design-preview/record-visit`.

**Step 3 built (2026-10-30):**
- **Visit details (`/staff/visits/[id]`):** the date, the mother (link), week, appointment or walk-in, and who recorded it and when; vital-sign tiles with units; services given with details and results; notes.
- **Edit visit (`/staff/visits/[id]/edit`):** the same form, filled in (`update_visit`). It's offered on the visit's day, or always to admins; otherwise the page says only an admin can change it.
- **Mother record → Visits tab:** **Record visit** (with a current pregnancy), then "This pregnancy" and "Earlier pregnancies" lists, each visit opening its details.
- **Links:** the recent visits and "Visit recorded" on the Visits page, and "Skip for now" after saving, all open the visit details.
- On phones, the record's tab bar scrolls the current tab into view (`components/shared/scroll-active-into-view.tsx`).
- Dev previews: `/design-preview/visit-detail`, `/design-preview/mother-record?tab=visits`.

**Step 4 built (2026-10-30):** the mother's **Visits** page (`/mother/visits`, feature `features/mother-visits`).
- **Next visit:** her next confirmed (or else waiting) visit, with See appointments, or Request a visit when none is booked.
- **"Your numbers":** weight and blood pressure charts for this pregnancy by week (display only, with "For your information only. Your midwife will explain…"). They appear after the second visit.
  - Plain SVG, drawn at the real width so labels stay 13px.
  - Hover or arrow keys show one readout for every line.
  - The two blood-pressure lines are labelled "Top" and "Bottom", and "Show as table" lists every value.
  - Colours (green `#16805F`, soft rose `#E08F82`) passed the dataviz validator for colour-blind separation. The rose is light, which is why the lines carry labels and the table exists.
- **Her visits:** a week tile, date, BP, weight and services. Each opens `/mother/visits/[id]` with her measurements and what she received. Staff visit notes are not shown to mothers.
- Dev preview: `/design-preview/my-visits` (`?visit=1` for one visit).

**Step 5 review (2026-10-30):**
- **Checks:** production build, typecheck and lint pass.
- **Contrast:** all text is at least 4.5:1 (lowest: the week badge, 4.77). The soft rose chart line is 2.5:1 by design; its values are always in text too (direct label, readout, table).
- **Design review:** returned 7 fixes, all applied and confirmed in a second pass (verdict "ship"):
  - the double-check notice names the fields, and the page scrolls to the first one;
  - the BP notes are linked to both BP fields for screen readers;
  - the charts show "Week of pregnancy";
  - the chart readout stays after a tap, and arrow keys are announced;
  - the staff Visits cards put Record visit on its own row on phones;
  - each service has its own example detail;
  - Filipino uses "bisita" everywhere.
- **Extras:** the duplicate BP legend is removed (the direct labels stay), and "Show as table" uses the app's caret icon.
- **Docs:** `DESIGN.md` + sidecar updated for Phase 5. Review screenshots deleted.
- **Still needed:** your testing.

## Phase 6 — Missed appointments & follow-ups

- **Daily check (pg_cron, 6:00 PM):** CONFIRMED/RESCHEDULED appointments whose time has passed with no visit → MISSED, and a MISSED_NOTICE SMS is queued.
- **Follow-up queue** for staff: log a follow-up (call, SMS or home visit + outcome), several per appointment, and rebook from there.

**Decisions (asked 2026-10-30):**

| Topic | Decision |
|---|---|
| When a visit counts as missed | A **daily check at 6:00 PM** Manila time (pg_cron runs on UTC, so 10:00 AM UTC). Every open appointment whose time has passed turns **Missed**; a skipped day is caught up on the next run. **If any visit was recorded for her that day**, her other appointments that day become **Completed** instead (e.g. a checkup and a TT shot booked back to back, with only one linked to the visit). A visit recorded after 6 PM can still be linked to the Missed appointment, which then becomes Completed. |
| Which appointments | **Confirmed and New time sent** both turn Missed and go on the follow-up list. **Only Confirmed ones get the SMS**: she never agreed to an unanswered new time (and no SMS told her about it), so staff reach her instead. |
| Closed pregnancies | **Closing a pregnancy cancels its open appointments** (remark "Pregnancy closed") and removes their unsent messages, so no reminder or missed notice reaches her after a birth or a loss. The check skips pregnancies that aren't current. |
| Requests past their date | A request whose date passes before staff answer it **stays in Requests, marked "Date passed"**. Confirm is hidden; staff offer another time or cancel it. The check leaves it alone. |
| Missed-visit SMS | **Taglish, direct**, one message for everyone, queued for **8:00 AM the next morning**. It is **removed** if, before then, a visit is recorded, she's rebooked, her pregnancy is closed or staff close the follow-up. Misses found more than 2 days late (e.g. old test appointments) get no SMS. Every mother has a mobile number, so no one is skipped. Phase 6 only queues it; sending starts in Phase 7. |
| Follow-up list | One item per missed appointment, **open until** she has a new appointment (booked by staff or her own request, not cancelled), a visit is recorded for her, her pregnancy is closed, or a health worker ticks **"No more follow-up needed"**. Sorted-out items move to a **Closed** tab that says how each one ended. |
| Sorting and filters | **Oldest first**, with "Missed N days ago". Search by name or mobile; filters for purok, missed date (from–to) and "Not contacted yet" / "Tried already". 20 per page; table on desktop, cards on phones. |
| Logging a follow-up | **Method** (Call, SMS from the health worker's phone, Home visit), **date** (today by default; not in the future or before the missed visit), **result** (Reached her / Couldn't reach her), **notes**, and an optional **"No more follow-up needed"** with a reason (moved away, getting care elsewhere, other). Several per missed appointment. |
| Editing | **Same day, any health worker; admins any time** (the same rule as visits). Only admins delete. |
| Rebooking | After logging a follow-up where she was reached, an optional **"Book a new appointment"** step (like Phase 5's next checkup: the shared booking form, starting with the missed service and the first open weekday from tomorrow). Every item also has **Rebook**. It books CONFIRMED and queues the reminder, and the item leaves the list. |
| Mother view | A **gentle blush notice** on her Appointments page and in the Today "Next visit" card ("We missed you at your Prenatal Checkup on Tue, Nov 3") with **Request a visit** or a line to contact the health center, shown while the missed visit is still open. **Follow-up notes become staff-only** (today the database lets mothers read them). |
| Staff views | **Mother record → Follow-ups tab:** her missed appointments (open first), each with its follow-up log and the same actions. The Follow-ups page shows the open count. **The staff dashboard stays in Phase 8.** |

Sample missed-visit SMS (157 characters, one SMS; the longest service name with a long first name makes 186, two parts):
> Hi Ana! Hindi ka nakarating sa Prenatal Checkup mo noong Tue, Nov 3. Pumunta o tumawag sa health center para sa bagong schedule. Salamat! -Taysan MaternaCare

**Build, in steps (each ends with screenshots for you):**
1. **Database (migration `0015_phase6.sql`, run by you):**
   - Turns on **pg_cron** and schedules the check every day at 6:00 PM Manila (`mark_missed_appointments()`). You can also run it by hand in the SQL Editor to test.
   - **The check:** Missed, or Completed when she had a visit that day; skips pregnancies that aren't current; queues the SMS for Confirmed ones (8:00 AM the next morning; none for misses more than 2 days old).
   - **Closing a pregnancy** cancels its open appointments and removes their unsent messages. Pregnancies closed before this migration get the same clean-up once.
   - An unsent missed notice is **removed** when she's rebooked, a visit is recorded, her pregnancy closes or staff close the follow-up.
   - **`follow_up`** gains a result, a close reason and the time it was logged. Rules: only on Missed appointments; recorded by the logged-in staff member; date not in the future or before the missed visit; health workers edit on the day it was logged, admins any time; only admins delete; **only staff can read follow-ups**.
   - A read-only **follow-up list** for staff (open or closed, how it ended, attempts so far), and a small function that tells a mother which of her missed visits are still open.
   - App types and `docs/database-setup.md` updated.
2. **Staff Follow-ups page** (`/staff/follow-ups`, feature `features/follow-ups`):
   - **Open** (with its count) and **Closed** tabs; search and filters; oldest first; table on desktop, cards on phones.
   - Each item: her name (links to her record), mobile (tap to call), purok, the missed service and time, "Missed N days ago", attempts so far, **Log follow-up** and **Rebook**.
   - **Log follow-up** dialog. Entries can be edited (same day, or admins) and deleted (admins).
   - After logging a follow-up where she was reached: **Book a new appointment?** opens the booking step (`/staff/follow-ups/[appointmentId]/rebook`), or Skip.
3. **Mother record → Follow-ups tab**, plus appointment touches:
   - Her missed appointments (open first, then closed with how each ended), each with its follow-up log and the same actions.
   - Staff Appointments: Missed cards link to her follow-ups; requests past their date say "Date passed" and drop Confirm.
4. **Mother side:** the gentle missed-visit notice on Appointments and in the Today "Next visit" card, with Request a visit.
5. **Review:** screenshots, contrast and accessibility checks, an independent design review, fixes, then `DESIGN.md` updated by the documenter. Review screenshots deleted afterwards. Then your testing and sign-off.

**Needs from you:** run `0015_phase6.sql`. If it can't turn on pg_cron, enable it in Supabase → Database → Extensions first, then run the file again (it's safe to re-run).

**For Phase 7:** the sender should skip Pending messages whose time passed long ago, so notices queued while testing Phase 6 aren't sent late.

**Step 1 done (2026-10-30):** migration `0015_phase6.sql`, run and checked by you (follow-up columns as expected; the job is active at `0 10 * * *`).
- **pg_cron** is turned on; the job `mark-missed-appointments` runs at 10:00 UTC (6:00 PM Manila). To test by hand: `select public.mark_missed_appointments();`.
- **The check:** Confirmed / New time sent appointments of current pregnancies whose time has passed become Missed, or Completed if she had any visit that day. A missed Confirmed one gets the SMS for 8:00 AM the next morning, unless it is more than 2 days old or she was already rebooked. An appointment that changes while the check runs is left alone.
- **Follow-ups:** new `result`, `close_reason` and `created_at`. Only on Missed appointments; saved as the logged-in staff member; the date defaults to today, never in the future or before the missed day; health workers edit on the day it was logged, admins any time; "Other" as the close reason needs a note; only staff can read them.
- **The list (`follow_up_item`):** one row per Missed appointment with the tries so far, the last try, and how it ended (came in, rebooked, closed by staff, pregnancy closed), or open. It follows each reader's own access rules. Mothers use `my_open_missed_visits()` instead, which never includes notes.
- **Clean-up rules:** an unsent missed notice is deleted as soon as its follow-up is sorted out. Closing a pregnancy cancels its open appointments ("Pregnancy closed"); pregnancies already closed get this once when the migration runs.
- App types and `docs/database-setup.md` updated (including how to see and test the job).

**Step 2 built (2026-10-31):** staff Follow-ups page (`/staff/follow-ups`, feature `features/follow-ups`), approved by you.
- **Open (with its count) and Closed tabs:** search by name or mobile; filters for purok, missed date and "Not contacted yet" / "Tried already". Open ones oldest first, closed ones most recently sorted out first; 20 per page. A table from 1280px wide, cards below (two columns on tablets).
- **Each missed visit:** her name (opens her record's Follow-ups tab), mobile (tap to call), purok, the missed service and time, "Missed N days ago", the tries so far with the last one, **Log follow-up** and **Rebook**. Closed ones say how they ended.
- **Log follow-up dialog:** how (Call, SMS from your phone, Home visit), reached her or not, the date (today by default), notes, and "No more follow-up needed" with a reason ("Other" needs a note). **See log** lists every entry with who logged it: Edit on the day it was logged (admins any time), Delete for admins (asks first).
- **After "Reached her":** "Book a new appointment?" opens `/staff/follow-ups/[appointmentId]/rebook` (the shared booking form with the missed service and the first open weekday from tomorrow), or Not now.
- The "first open weekday" logic is now shared with Phase 5's next-checkup step (same behaviour). Home visits use a door icon.
- Dev previews: `/design-preview/follow-ups` (`?tab=closed`, `?admin=1`, `?show=offer`) and `/design-preview/follow-ups-rebook`.

**Step 3 built (2026-10-31):** her record's Follow-ups tab and the appointment touches, approved by you.
- **Mother record → Follow-ups tab:** a rose count on the tab while she has open follow-ups. "Needs follow-up", then "Closed" with how each ended, newest first. Each missed visit shows its whole log in place (Edit on the day it was logged or by admins, Delete for admins) with **Log follow-up** and **Rebook**. Rebooking started there goes back to her record.
- **Appointments:** requests whose time has passed say "Date passed" and drop Confirm (Requests, List, Calendar and her record, where they stay under Upcoming). Missed appointments have **See follow-ups**, which opens her record's Follow-ups tab. The List view now shows its table from 1280px wide (cards below), so the actions aren't cut off beside the sidebar.
- **Visits page:** an appointment the 6 PM check marked Completed without a linked visit says "Completed at her visit" and opens that visit.
- **Test data:** `supabase/test-data/phase6-step3.sql` (not a migration) adds missed visits, a passed request and a Completed-without-visit appointment for two test mothers; its PART 2 removes them.
- Dev previews: `/design-preview/mother-record?tab=followUps` (`&admin=1`, `&followUps=none`), `/design-preview/staff-appointments` (now with a passed request and a missed appointment), `/design-preview/visits` and `/design-preview/follow-ups-rebook?from=record`.

**Step 4 built (2026-10-31):** the mother-side missed-visit notice, approved by you.
- **Today:** while she has an open missed visit, the Next visit card becomes a wide blush notice across the row ("We missed you at your Prenatal Checkup on Fri, Oct 23."), with the line to request a visit or contact the health center, her next booked visit (if any) and **Request a visit**. Tip and Danger signs sit side by side below it. Otherwise Today is unchanged.
- **Appointments:** one notice under the header; with two or more missed visits it says "We missed you" and lists them (one new request closes them all). The header's Request a visit button is right above it.
- **Her requests whose time has passed** stay under Upcoming with "Date passed. The health center will suggest another time." She can still cancel them.
- Filipino: "Na-miss ka namin sa iyong … noong …". The health center's number shows as a call link once the placeholder in `src/config/site.ts` is replaced.
- Dev previews: `/design-preview/mother-today?missed=1` (or `2`, `&next=none`) and `/design-preview/mother-appointments?missed=1` (or `2`, `&passed=1`).

**Step 5 review (2026-10-31):**
- **Checks:** production build, typecheck and lint pass.
- **Contrast:** all Phase 6 text is at least 4.5:1 (lowest: the Today hero note, 4.67). The only lower ones are Phase 4's faded taken times and closed calendar days, accepted then. One h1 per page, no skipped heading levels, every control named.
- **Design review:** returned 6 fixes and 3 optional ones. 5 fixes and 2 optional ones were applied and confirmed in a second pass (verdict "ship"):
  - keyboard focus shows a green ring on every button again (it was missing app-wide: in Tailwind v4 `outline-none` also turns the outline style off, so buttons need `focus-visible:outline-solid`);
  - the Rebook page and the next-checkup step say "Service", "Day", "Time" without numbers (the staff booking page keeps "1. Mother", "2. Service"...);
  - the Appointments List filters use two rows below 1280px wide, so "All statuses" and the dates aren't cut off;
  - Rebook is a mint button, so it stands out on white cards;
  - a time never breaks between "9:00" and "AM", and the Filipino "makipag-ugnayan" no longer breaks at its hyphen;
  - (optional) her record lists open follow-ups oldest first, like the Follow-ups page;
  - (optional) the Today tiles line up: text under the title, icon at the bottom.
  - The reviewer withdrew the sixth fix (a bigger See log button: it is already 44px tall). The third optional one (the Today week number's size) is recorded in `DESIGN.md` instead.
- **Extras:** Today's "Next visit:" line in the missed notice keeps its date and time together, so a narrow phone breaks after the label (your choice).
- **Docs:** `DESIGN.md` + sidecar updated for Phase 6 (follow-up cards and chips, the missed-visit notice, and rules for the focus ring, unbroken times, real step numbers, wide filter rows and the button beside a main action). Review screenshots deleted.
- **Recorded in `DESIGN.md`, left as they are:** white "Call" (follow-up cards on phones), "See follow-ups" (Missed appointments) and "Other time" (staff appointments, from Phase 4) buttons on white cards; the landing page's sample SMS times; the Today week number's size.
- **Still needed:** your testing and sign-off. `supabase/test-data/phase6-step3.sql` gives two test mothers missed visits.

## Phase 7 — SMS reminders (HTTPSMS)

- **Sender:** a protected route in this app (`/api/cron/send-sms`) sends due PENDING messages through HTTPSMS and saves the result (`sent_at`, `provider_message_id`, errors). Supabase `pg_cron` + `pg_net` call it every few minutes with `CRON_SECRET`. (Vercel's free plan only runs its own scheduled jobs once a day, which is too slow.)
- **Delivery updates:** an HTTPSMS webhook route updates the status to DELIVERED or FAILED.
- **Messages:** Taglish texts of up to 2 SMS (306 plain characters); the number is copied from the mother's contact when queued and follows her record until it's sent.
- **Admin SMS log** with filters and retry for failed messages.
- **Request answers:** a text when staff confirm her request, propose a new time, or decline it.

**Decisions (asked 2026-10-31; test mode dropped and request texts added 2026-11-01):**

| Topic | Decision |
|---|---|
| Testing while building | An admin **Send now** button runs the same sender on your laptop. Every run also asks HTTPSMS about texts it already took, so sending and delivery can be tested without a public address. **Changed 2026-11-01:** instead of a tunnel test, the app was **deployed to Vercel** and its address put in Vault, so the real schedule runs from then on (step 6). |
| Schedule | `pg_cron` + `pg_net` call the sender **every 5 minutes, day and night** (from `0018`; before that, during sending hours) with `CRON_SECRET`. The sender's address and `CRON_SECRET` are kept in **Supabase Vault** (you add them in the SQL Editor; never in a migration file). Without an address the job does nothing. |
| No test mode (changed 2026-11-01) | **Texts always go to her number.** The Test / Live switch, the test number and "Send a test SMS" built in step 2 are removed (migration `0017`). Before that change goes in, you check the waiting texts and the demo ones are marked Skipped, so no made-up number gets a text. There is no pause switch: to stop the schedule, remove the Vault sender address. |
| Sending hours (changed 2026-11-01) | **None: a due text goes on the next run, day or night** (`0018`). Reminders are still queued for 8:00 AM N days before and missed-visit notices for 8:00 AM the next morning, so night texts are only retries, late bookings, request answers given at night and Send now. |
| Per run | **At most 20 texts per run.** HTTPSMS spaces them at the phone's rate (10 a minute by default; Android allows up to 29 without root). |
| Too late | **By type:** a visit reminder is skipped once the visit time has passed, or when the visit was moved or cancelled; a missed-visit notice is skipped when it's more than 1 day late or her follow-up is already sorted out; a request answer is skipped when the appointment changed again before it went out, or when it's more than 1 day late. Skipped texts are marked **Skipped** with the reason and never sent. This also clears the old texts queued while testing Phase 6. |
| Failures | **Tried again automatically 2 more times, 30 minutes apart**, while still in time. Then it stays **Failed** and an admin can press **Retry**. A number that can't be used, or a text that's too long, isn't retried automatically. |
| Delivery updates | The **HTTPSMS webhook** (`/api/webhooks/httpsms`) handles sent, delivered, failed and expired, plus the phone's offline / online heartbeat. Every call must carry a token signed with `HTTPSMS_WEBHOOK_SIGNING_KEY` (HS256, issued by api.httpsms.com, not expired); anything else is refused. Each sender run also **asks HTTPSMS about texts with no news yet, for up to a day**; after that a text without a delivery report stays **Sent** (some networks never send one). A phone that is off: HTTPSMS gives up after about 5 minutes, and the text becomes Failed ("phone offline") and follows the retry rule. |
| Language | **Taglish for everyone** (the Phase 4 decision, confirmed). The landing page's "Sent in English or Filipino" becomes "Sent in simple Taglish" / "Ipinapadala sa simpleng Taglish". |
| Length | **Up to 2 texts (306 characters), plain characters only:** no special dashes or no-break spaces, accents dropped (ñ stays), so each text holds 160 characters. A longer text is never cut off: it isn't sent and shows "Failed: too long". |
| Sign-off | **"-Brgy. Taysan Health Center"**. The reminder says "sa health center" so the name isn't said twice. The missed-visit notice becomes 2 texts. |
| Admin SMS log | **Admins only** (Admin group). Counts at the top (waiting, sent today, failed) that filter the list; filters for status, type, date range and mother (name or number); **Send now**; **Retry** on failed texts; **phone and plan status** ("SMS phone offline since 2:15 PM", and a warning when HTTPSMS refused texts because the monthly limit was reached). |
| Request answers (added 2026-11-01) | **Three texts, sent when staff answer her request:** confirmed, new time proposed (she accepts or declines in the app) and declined. **No staff remarks** in the text (they can be long or private); the declined text points her to the health center. Only staff decisions send one: her own cancel, accept or decline sends nothing, and so do visits staff book directly. Queued at once, so it goes out on the next run (within 5 minutes). |
| Reminder overlap | If her visit reminder would go out **the same day** as her "Confirmed" text, the reminder is marked **Skipped** (the Confirmed text already gives the date and time), saving texts from the monthly limit. |
| Mother record → SMS log tab | Her texts, newest first: what it was about (visit reminder, missed-visit notice or request answer, with the service and time), the full text, the number it went to, and its status with the time, or why it failed or was skipped. **Admins also get Retry** on failed ones. |
| Her appointment cards | Her confirmed visit shows one line: "Text reminder on Wed, Nov 4, 8:00 AM to 0917 123 4567", then "Reminder sent Nov 4", so she can spot a wrong number early. |
| Number changes | When her mobile number changes, **her waiting texts move to the new number**; sent ones keep the number they went to. |
| Who writes SMS rows | **Health workers can no longer add or edit SMS rows directly** (an old database rule allowed it, which would let any staff login text anything to any number). Only the database's own rules and the server sender write them; Retry goes through an admin-only function. |

Sample reminder (137 characters, one SMS):
> Hi Ana! Paalala: Prenatal Checkup mo sa Thu, Nov 5, 9:00 AM sa health center. Dalhin ang booklet mo. Salamat! -Brgy. Taysan Health Center

Sample missed-visit notice (165 characters, two SMS):
> Hi Ana! Hindi ka nakarating sa Prenatal Checkup mo noong Tue, Nov 3. Pumunta o tumawag sa health center para sa bagong schedule. Salamat! -Brgy. Taysan Health Center

Sample request answers (one SMS each with this service name; a longer name may make 2):
> Hi Ana! Kumpirmado na ang Prenatal Checkup mo sa Thu, Nov 5, 9:00 AM sa health center. Salamat! -Brgy. Taysan Health Center

> Hi Ana! May bagong oras para sa Prenatal Checkup mo: Fri, Nov 6, 10:00 AM. Buksan ang app para tanggapin o tanggihan. Salamat! -Brgy. Taysan Health Center

> Hi Ana! Hindi naaprubahan ang hiling mong Prenatal Checkup sa Thu, Nov 5, 9:00 AM. Tumawag o pumunta sa health center. -Brgy. Taysan Health Center

**Build, in steps (each ends with screenshots for you):**
1. **Database (migration `0016_phase7.sql`, run by you):**
   - Turns on **pg_net**.
   - **SMS settings** (one row, admins only): Test or Live (starts in Test), the test number, who changed it and when; the phone's online / offline status, and when HTTPSMS last refused texts for the monthly limit.
   - **Each text** gains: its tries so far and when the next one is due, where it actually went (the test number in Test mode), when it was delivered, and when HTTPSMS was last asked about it. A new status **Skipped** (not sent, on purpose, with the reason).
   - **Who writes texts:** the old staff insert and update rules are removed. `retry_sms()` lets admins put a failed text back in the queue, only while it's still in time.
   - **Taking due texts** (`claim_due_sms()`, server only): at most 20, inside sending hours (any time in Test mode), marking the ones that are too late Skipped, and locking each one so two runs never send the same text.
   - **New wording** ("sa health center", "-Brgy. Taysan Health Center") for new texts and for texts still waiting.
   - **Her number changes:** her waiting texts move to the new number.
   - **The schedule:** job `send-sms` every 5 minutes from 8:00 AM to 7:55 PM Manila (`*/5 0-11 * * *` in UTC). It calls the sender address kept in Vault with `CRON_SECRET`, and does nothing until the address is set.
   - App types, `docs/database-setup.md` (Vault, the job, check queries) and this plan's secrets list (`HTTPSMS_WEBHOOK_SIGNING_KEY`) updated.
2. **The sender and the SMS log controls** (feature `features/sms`):
   - Server-only HTTPSMS calls with plain `fetch` (send a text, look up a text's status). Numbers `09…` become `+639…`; plain characters and the 2-text limit are checked.
   - **One sender run:** take the due texts. In Live they go to her number; in Test, to the test number (or they're marked "Test mode: not sent"). Save Sent with HTTPSMS's message id, or Failed with the reason (2 automatic retries, 30 minutes apart). Then ask HTTPSMS about texts with no news yet. If HTTPSMS refuses because the monthly limit is reached, the run stops, the texts keep waiting, and the page shows a warning.
   - `POST /api/cron/send-sms` runs it, only with `Authorization: Bearer CRON_SECRET`.
   - On `/admin/sms`: the Test / Live switch (Live asks to confirm and shows the waiting count), the test number, **Send now**, **Send a test SMS** and the plan status.
   - **The first real SMS goes only to your test phone, after your OK.**
3. **No test mode, and request answers (migration `0017_phase7_live.sql`, run by you; changed 2026-11-01):**
   - **First, the queue check:** a read-only query lists the waiting texts; the ones you mark as demo are made Skipped in `0017`.
   - **Database:** `sms_setting` loses `mode` and `test_number` (and the `sms_mode` type); `claim_due_sms()` keeps sending hours for every text. Three new text types for request answers, queued by a trigger only when staff confirm, propose a new time for, or decline a waiting request (her own changes queue nothing). The too-late rules for them, and a same-day reminder Skipped when a Confirmed text goes out.
   - **App:** the sender always uses her number; the Test / Live card, the test number, "Send a test SMS" and the "Test mode: not sent" reason are removed. `/admin/sms` keeps **Send now** and the phone and plan status. Types, dictionaries, `docs/database-setup.md` and the dev preview updated.
4. **The log, her record's SMS log tab and the staff cards:**
   - **`/admin/sms` list:** counts at the top (waiting, sent today, failed) that filter the list; filters for status, type (including request answers), date range and mother (name or number); 20 per page; a table on desktop and cards on phones. Each text shows her name (links to her record), the number it went to, the type and the visit, the status with its time or reason, and the full text; **Retry** on failed ones.
   - **Mother record → SMS log tab:** her texts, newest first; Retry for admins.
   - The staff appointment cards' reminder line learns the new states (trying again, skipped).
5. **Delivery webhook and the mother side:**
   - `POST /api/webhooks/httpsms`: checks the token; sent, delivered, failed and expired update the text; phone offline / online update the status line on `/admin/sms`; texts it doesn't know are ignored. Tested locally with a hand-signed call (the key is read from `.env.local`, never printed).
   - **Her confirmed visit card:** "Text reminder on … to …", then "Reminder sent …".
   - **Landing page:** the SMS fact says Taglish. (Its sample text bubbles are written in each page's language; whether they switch to the real Taglish wording is your call at this step.)
6. **Live on Vercel (changed 2026-11-01, replaces the tunnel test):** the app is deployed to `taysanmaternacare.vercel.app` with the `.env.local` values plus `NEXT_PUBLIC_SITE_URL` as Vercel environment variables; the Supabase Auth site and redirect URLs point there; the Vault secrets `sms_sender_url` (`…/api/cron/send-sms`) and `cron_secret` are set, so the schedule sends with nobody clicking anything. After step 5 is pushed and deployed: HTTPSMS → Settings → Webhooks gets `https://taysanmaternacare.vercel.app/api/webhooks/httpsms` with the signing key (events: sent, delivered, failed, expired, phone offline / online), and we watch a text be marked Delivered by the webhook. New code reaches the live site only when you commit and push.
7. **Review:** screenshots, contrast and accessibility checks, an independent design review, fixes, then `DESIGN.md` updated by the documenter. Review screenshots deleted afterwards. Then your testing and sign-off.

**Needs from you:**
- An Android phone with the HTTPSMS app, logged in to your HTTPSMS account. Its SIM needs load or an unlimited-text promo; on a dual-SIM phone, the HTTPSMS app must send from the SIM whose number is `HTTPSMS_FROM_NUMBER`. The HTTPSMS free plan allows 200 messages a month, replies included (the paid plan allows 5,000). Request answers add a text per decided request, so watch the count.
- In `.env.local` (then restart the dev server): `HTTPSMS_API_KEY`, `HTTPSMS_FROM_NUMBER` (the phone's number as `+639…`), and two long random strings you make up: `CRON_SECRET` and `HTTPSMS_WEBHOOK_SIGNING_KEY` (the signing key is also typed into HTTPSMS in step 5).
- Run `0016_phase7.sql`. If it can't turn on pg_net, enable it in Supabase → Database → Extensions first, then run the file again.
- For step 3: the waiting-texts check, telling me which texts are demo ones.
- For step 6: the Vercel deploy and the two Vault secrets (done 2026-11-01); after step 5, the HTTPSMS webhook form.

**Not in Phase 7:** mothers' replies in the app (they stay on the SMS phone). Texts when staff move or cancel a confirmed visit were added on 2026-11-02 (see the note at the end of this phase).

**Step 1 done (2026-11-01):** migration `0016_phase7.sql`, run and checked by you (14 checks as expected; no texts in the queue yet, so the new wording first shows in step 2).
- **pg_net** is on. Texts have a new status **Skipped** and new columns: `attempt_count`, `next_attempt_at`, `claimed_at`, `sent_to`, `delivered_at`, `status_checked_at`, `status_reason` (a short code; `error_message` keeps HTTPSMS's own text). A retry waits as Pending with `next_attempt_at`; Failed is final.
- **`sms_setting`** (admins only): starts in Test, no test number yet.
- **Who writes texts:** the staff insert / update rules are gone; `retry_sms()` (admins) puts a Failed text back in the queue, to her current number, while it's still in time.
- **`claim_due_sms()`** (server only): marks too-late texts Skipped (`visit_passed`, `visit_changed`, `notice_late`, `follow_up_closed`), then takes up to 20, inside 8:00 AM–8:00 PM Manila (any time in Test), each locked for 10 minutes and counted as a try. The sender clears `claimed_at` when it saves a result.
- **Wording:** "sa health center", "-Brgy. Taysan Health Center", plain characters (`sms_plain()`). A text already tried becomes Skipped if its visit changes or its follow-up is sorted out. Waiting texts follow a changed number.
- **Job `send-sms`** at `*/5 0-11 * * *`: quiet until the Vault secrets `sms_sender_url` and `cron_secret` exist.
- App types, `docs/database-setup.md` (Vault lines, the job, check queries) and the secrets list updated; the staff cards got a Skipped label.

**Step 2 built (2026-11-01):** the sender (`features/sms`), `POST /api/cron/send-sms` and the `/admin/sms` controls. The first test SMS reached your phone once the HTTPSMS app sent from the 0954 SIM (it had been using the other SIM). **Changed the same day:** test mode is dropped and request answers are added (new step 3); its Test / Live parts are removed there.

**Step 3 built (2026-11-01):** migration `0017_phase7_live.sql`, run and checked by you (11 checks as expected; Jennilyn Dugan's 2 waiting reminders kept, she's a real mother).
- **No test mode:** texts always go to her number. `sms_setting` keeps only the phone and plan status; the Mode card, test number and "Send a test SMS" are gone, and `/admin/sms` has one card (**Send now**, phone and plan status).
- **Request answers:** `REQUEST_CONFIRMED`, `REQUEST_NEW_TIME`, `REQUEST_DECLINED`, queued only when staff answer a waiting request; dropped if the appointment changes again before they go, Skipped when more than 1 day late (`answer_late`), when the time passed or when the appointment no longer matches. A reminder due the same day as the Confirmed text is saved Skipped (`covered_by_answer`).
- **Then, the same day: no sending hours** (your choice): migration `0018_sms_any_time.sql`, run and checked by you (4 checks as expected), takes due texts at any hour and runs `send-sms` every 5 minutes all day (`*/5 * * * *`).

**Step 6 done early (2026-11-01):** the app is live at `taysanmaternacare.vercel.app` (pushed as `cbd50b5`). Checked: the sender answers 401 without the secret and 405 for GET, preview pages are hidden; after you added both Vault secrets, the `send-sms` job got **200** every 5 minutes. Jennilyn's reminder #3 was Delivered (sent with Send now at 10:53 PM, 2nd try); reminder #2 (Nov 2, 8:00 AM) is the first fully automatic text. The HTTPSMS webhook waits for step 5.

**Step 4 built (2026-11-01):** migration `0019_sms_log.sql`, run and checked by you (5 checks as expected), and approved by you.
- **View `sms_log_item`** (runs as the reader: staff see every text, a mother her own): each text with her name, the service and the appointment; `shown_at` = when it went out, else when it is next due.
- **`/admin/sms`:** the Send card became an "Automatic sending" bar (schedule, phone status, Send now); counts **Waiting / Sent today / Failed** that filter the list (tapping the one in use shows all); filters for name or number, status, type (visit reminders, missed-visit notices, request answers) and date range; all texts newest first, 20 per page, a table from 1280px and cards below; **Show text** opens the full message; **Retry** on failed texts at once, no confirm step (your choices).
- **Her record → SMS log tab:** her texts as cards, newest first; Retry for admins (health workers see the tab without it).
- **Staff appointment cards:** reminder line only (your choice), now also "trying again …" and "No reminder needed: her Confirmed text gave the time"; the card shows the newest reminder queued.
- English and Filipino; previews `/design-preview/sms` and `/design-preview/mother-record?tab=sms&admin=1`.

**Step 5 built (2026-11-02):** no migration; approved by you.
- **Webhook `POST /api/webhooks/httpsms`:** accepts only HTTPSMS's signed token (HS256 with the signing key, issuer `api.httpsms.com`, this webhook's address, not expired); anything else gets 401. Sent, delivered and failed update the text at once; **expired counts as failed only on HTTPSMS's last try** (your choice; the 5-minute status check follows the same rule now); phone online / offline update the status on `/admin/sms`; events from another phone or for unknown texts are ignored. Tested locally with hand-signed calls (401 / 200 ignored / 400 as expected, nothing written).
- **Her confirmed visit card:** "Text reminder on … to …" while waiting, "Reminder sent …" once sent; if it failed, "We couldn't text your reminder." with a link to her profile to check her number; nothing when it wasn't needed (your choice). Preview `/design-preview/mother-appointments?reminder=sent|failed|none`.
- **Landing page:** the sample is the real Taglish text in both languages, and the fact line says "Sent in simple Taglish" (your choice); the hero card matches.
- **After you push:** fill in the HTTPSMS webhook form (step 6) and watch a text be marked Delivered by the webhook.

**Layout change (2026-11-02, your request):** migration `0020_sms_layout.sql`: every text reads "Hi {name}!", the message, then "From: Brgy. Taysan Health Center", with a blank line between; `sms_plain()` keeps line breaks; the Declined text ends "Thank you!"; waiting texts switched too. The landing sample matches.

**Added (2026-11-02, your request): texts when staff move or cancel a visit.** Admins and health workers alike (the database checks the role, not the screen). Migration `0021_sms_visit_changes.sql`, after 0020:
- **Moved, she has a login** (she must accept it in the app): the "New time proposed" text, as for a request ("May bagong oras … Buksan ang app para tanggapin o tanggihan."). Also when staff change a time she hasn't answered yet.
- **Moved, no login** (confirmed at once): new type **Visit moved**: "Inilipat ang {service} mo sa {date, time} sa health center. Salamat!" A day-before reminder that would go the same day is Skipped, as after a Confirmed text.
- **Cancelled** (a confirmed visit, or one with a new time she hasn't answered): new type **Visit cancelled**: "Kinansela ang {service} mo sa {date, time}. Tumawag o pumunta sa health center para sa bagong schedule. Thank you!"
- **No cancel text** when her pregnancy is closed (that cancels her open visits) or when the visit time has passed; her own cancel, accept or decline sends none, as before.
- Too-late rules as for request answers. SMS log: the two new types, the "Request answers" filter becomes "Answers and changes"; English and Filipino; previews.

**Instant sending (2026-11-02, your choice):** when staff approve, decline, propose a new time, move or cancel, the app runs the sender right after saving (`sendSoon`, using Next's `after()`, so the staff screen isn't slowed), and the text goes within seconds. The 5-minute `send-sms` job stays for visit reminders (8:00 AM), missed-visit notices, retries and delivery checks, and picks up anything an instant send couldn't. Both take texts the same locked way, so a text is never sent twice. No migration.

**Step 6 done (2026-11-02):** the HTTPSMS webhook is saved and confirmed by you: texts are marked Delivered by it within seconds (Vercel Logs show its POST 200 calls). Migrations 0020 and 0021 run and checked by you; instant sending deployed and confirmed.

**Landing photo (2026-11-02, your choice):** the health center banner shows "Legazpi City view from Taysan" (Dexter P. Baldon, Wikimedia Commons, CC BY-SA 4.0) instead of the Pexels Mayon photo; credited in the footer and `docs/assets.md`. No freely usable photo of the barangay itself was found; a photo of the actual health center can replace it later.

**Step 7 review (2026-11-02):** desktop and phone screenshots (EN and FIL) of every Phase 7 screen were reviewed (not kept in the repo). Checks: production build, types and lint pass; every page has one h1, no heading skips, no unnamed controls; lowest contrast 4.52. The independent design review returned 7 fixes plus 6 optional ones; all were applied and confirmed in two more passes (verdict "ship"):
- Her failed reminder depends on the reason: only a bad number links to her profile; otherwise "your visit is still on".
- No sideways scroll on the landing page at 320–390px; the brand name wraps to two lines instead of being cut.
- SMS log copy names moved/cancelled texts and instant sending; "SMS phone: no status yet".
- Dates and times never break mid-slot (staff reminder line, her visit cards, FIL "para sa").
- "Show text" and the admin "See in SMS log" link are 44px tap targets.
- Admins get "See in SMS log" on a failed reminder; the SMS count tiles are tappable.

`DESIGN.md` was updated with the SMS log, chip outline, reminder line and header rules.

**Phase 7 signed off (2026-11-02):** you tested the review fixes on the live screens.

## Phase 8 — Dashboards & reports

- **Staff dashboard:** today's appointments, pending requests, missed needing follow-up, active pregnancies, mothers due within 30 days.
- **Reports** (date range + filters): active pregnancies, completed visits, upcoming and missed appointments, services given, SMS delivery. Print-friendly view + CSV export.
- **Admin dashboard:** account counts and SMS health.

## Phase 9 — Hardening & launch

- **Security:** RLS test per role, input validation, re-check login protection, security review.
- **Quality:** accessibility pass (contrast, keyboard, screen reader), performance pass, testing on real phones.
- **Deploy:** Vercel and its environment variables were set up in Phase 7 (step 6); here: Supabase backups and a final check of the live settings.
- **Hand-off:** demo seed data for the defense, short user guides per role, and support for the usability / reliability / maintainability evaluation.

---

## Open items

1. ~~`SUPABASE_SECRET_KEY` in `.env.local` (Phase 0).~~ Resolved 2026-11-02 (in use locally and on Vercel).
2. Health center contact number for the landing page (address and clinic hours received 2026-10-27).
3. ~~HTTPSMS phone + API key (Phase 7).~~ Resolved 2026-11-02 (texts are being delivered).
4. Manuscript updates listed on ERD page 2 (scope, named activities, single health center) — outside the code, for you to handle.

Resolved: database inspected (2026-10-26); the first admin gets both ADMIN and health worker profiles; language saved in a cookie; secrets in `.env.local`, no Edge Functions.
