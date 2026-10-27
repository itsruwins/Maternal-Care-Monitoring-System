# Maternal Care Monitoring System with SMS Reminder — Build Plan

Barangay Taysan, Legazpi City · Next.js 16 + Supabase · Hosted on Vercel

Status: **Phase 0 approved. Phase 1 built (2026-10-26). Redesign (Phase 1R, Flo-inspired): built and reviewed 2026-10-27 (finish review: all fixes resolved; DESIGN.md rewritten). Waiting for your testing and sign-off.** Each phase ends with a demo and your sign-off before the next starts.

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
2. Health center contact number for the landing page (address and clinic hours received 2026-10-27).
3. HTTPSMS phone + API key (Phase 7).
4. Manuscript updates listed on ERD page 2 (scope, named activities, single health center) — outside the code, for you to handle.

Resolved: database inspected (2026-10-26); the first admin gets both ADMIN and health worker profiles; language saved in a cookie; secrets in `.env.local`, no Edge Functions.
