# Database backups

The Supabase **free plan has no downloadable backups**, so we take our own: **every month, before every migration, and before any big change**. Each backup is tested by restoring it into a spare project at least once (the first one, and again after big schema changes).

A backup holds every mother's health record and every login (with password hashes). It is only ever stored **inside an encrypted disk image**.

## One-time setup

1. **Tools** (PostgreSQL client, outside the project): `brew install libpq`. It gives `pg_dump` and `psql` (version 18 or newer).
2. **Connection string:** Supabase → **Connect** → **Session pooler** (the free plan's direct connection needs IPv6, which most home networks lack). It looks like
   `postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@<pooler-host>:5432/postgres`.
   Keep it **without the password part** (delete `:[YOUR-PASSWORD]`). The password is typed in hidden each time; it never goes in a file, a script or your shell history.
3. **Database password:** Supabase → Project Settings → Database. If nobody knows it, reset it there (the app doesn't use it).
4. **Backup password:** make one long password for the disk images and keep it in your password manager. **Lose it and every backup is unreadable.**
5. **Google Drive:** a folder named **Taysan MaternaCare backups**, shared with nobody else.

## Taking a backup (about 5 minutes)

In Terminal (zsh):

```bash
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
DB="postgresql://postgres.<project-ref>@<pooler-host>:5432/postgres"   # Session pooler, no password
read -s "PGPASSWORD?Database password: " && export PGPASSWORD; echo

DAY=$(date +%F)
DIR="$HOME/Backups/taysan-db/$DAY"
mkdir -p "$DIR" && chmod 700 "$DIR"

# 1. The app's tables, rules (RLS), functions, views and permissions
pg_dump "$DB" --schema-only --schema=public --no-owner --quote-all-identifiers \
  --file "$DIR/schema.sql"

# 2. Every record, plus the login accounts (short-lived login data left out)
pg_dump "$DB" --data-only --schema=public --schema=auth --quote-all-identifiers \
  --exclude-table-data='auth.sessions' --exclude-table-data='auth.refresh_tokens' \
  --exclude-table-data='auth.flow_state' --exclude-table-data='auth.one_time_tokens' \
  --exclude-table-data='auth.mfa_challenges' --exclude-table-data='auth.audit_log_entries' \
  --exclude-table-data='auth.schema_migrations' --exclude-table-data='auth.instances' \
  --exclude-table-data='public.rate_limit_hit' --exclude-table-data='public.login_attempt' \
  --file "$DIR/data.sql"

unset PGPASSWORD
ls -lh "$DIR"    # both files should be well over 0 KB
```

**Lock it** (macOS built-in, AES-256; it asks for the backup password twice):

```bash
hdiutil create -encryption AES-256 -srcfolder "$DIR" -volname "taysan-db-$DAY" \
  "$HOME/Backups/taysan-db/taysan-db-$DAY.dmg"
```

Check it opens (double-click the `.dmg`, enter the password, see the two files, eject), then delete the unlocked folder:

```bash
rm -rf "$DIR"
```

Upload `taysan-db-<date>.dmg` to the **Taysan MaternaCare backups** folder on Google Drive and add a line to the log below.

**Keep:** the last 12 monthly backups and the last 3 taken before migrations. Delete older ones from Drive and from `~/Backups/taysan-db`.

### Not in the backup (on purpose)

These live outside the app's tables. For a real recovery they come back from the places listed:

| What | Comes back from |
|---|---|
| Extensions `pg_cron`, `pg_net` | Supabase → Database → Extensions (or the `create extension` lines in 0015 and 0016) |
| Sign-up trigger on `auth.users` (`on_auth_user_created_mother_signup`) | its block in `supabase/migrations/0004_mother_signup.sql` |
| Cron jobs `mark-missed-appointments`, `send-sms`, `clean-rate-limits` | the `cron.schedule(...)` blocks in 0015, 0018 and 0023 (plus the cron grants in 0015) |
| Vault secrets `cron_secret`, `sms_sender_url` | `docs/database-setup.md` → Vault secrets (values from your password manager) |
| Supabase settings: URLs, sign-ups, password length, rate limits, SMTP | `README.md` → Live settings |
| The reset email template | only in the Supabase dashboard: copy it out before retiring a project |
| Short-lived login data (sessions, reset codes), the abuse-limit logs | not needed: everyone just logs in again |

## Restore test (into a spare project)

> **Never add the cron jobs or the Vault secrets to the spare project.** With them it could send real texts to real mothers. The steps below don't add them.

1. **Make a spare project:** Supabase → New project in the same organization, name `taysan-restore-test`, region Seoul, any strong database password (needed only today). The free plan allows 2 active projects; pause another one first if needed.
2. **Open the backup:** double-click the `.dmg` and enter the backup password. The files are in `/Volumes/taysan-db-<date>/`.
3. **Load it** (Session pooler string of the **spare** project, without the password):

   ```bash
   export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
   SPARE="postgresql://postgres.<spare-project-ref>@<pooler-host>:5432/postgres"
   B="/Volumes/taysan-db-<date>"
   read -s "PGPASSWORD?Spare project password: " && export PGPASSWORD; echo

   psql "$SPARE" -v ON_ERROR_STOP=1 --single-transaction -f "$B/schema.sql"
   psql "$SPARE" -v ON_ERROR_STOP=1 --single-transaction \
     -c 'SET session_replication_role = replica' -f "$B/data.sql"

   unset PGPASSWORD
   ```

   `session_replication_role = replica` loads the records without running the app's triggers (no texts are queued, nothing is recalculated). If either command stops with an error, copy the last lines and fix it before going on (see "If the restore fails").
4. **Compare row counts.** Run this in the SQL Editor of **both** projects; every line should match, except `public.login_attempt` and `public.rate_limit_hit` (0 in the spare project, as they aren't backed up):

   ```sql
   select 'auth.users' as table_name, count(*) as row_count from auth.users
   union all
   select format('public.%I', table_name),
          (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text::bigint
   from information_schema.tables
   where table_schema = 'public' and table_type = 'BASE TABLE'
   order by 1;
   ```

5. **Check the access rules:** run `supabase/tests/rls-by-role.sql` in the spare project's SQL Editor. Expect **118 PASS, 0 FAIL** (it undoes itself, and with no cron jobs nothing is sent).
6. **Delete the spare project** (Project Settings → General → Delete project) and eject the `.dmg`. The spare project holds real patient data, so don't leave it running.
7. Mark the backup as restore-tested in the log.

### If the restore fails

- **`schema "public" already exists`** or **`extension … already exists`:** the spare project already has it. Make a fresh spare project and tell the developer the exact line; the guide gets a fix.
- **`unrecognized configuration parameter "transaction_timeout"`:** the project runs an older Postgres than the tools. Tell the developer.
- **`duplicate key` in an `auth` table:** that table needs excluding from the data backup; tell the developer which one.

## Real recovery (replacing the live database)

Only if the live project is lost or broken beyond repair. Do it with the developer.

1. New project (Seoul). Turn on `pg_cron` and `pg_net` under Database → Extensions.
2. Load `schema.sql` and `data.sql` as in the restore test, steps 3–4.
3. Run the sign-up trigger block from 0004, then the cron grants and the three `cron.schedule(...)` blocks (0015, 0018, 0023).
4. Add the two Vault secrets (`docs/database-setup.md`).
5. Redo the Supabase settings from `README.md` → Live settings, including Gmail SMTP and the reset email template.
6. In Vercel, update `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`, then redeploy.
7. Run `supabase/tests/rls-by-role.sql`, log in as staff and as a mother, and check the `send-sms` job runs (README → Live settings → checks).

## Backup log

| Date | Why (monthly / before migration NNNN / other) | By | Restore-tested |
|---|---|---|---|
| | | | |
