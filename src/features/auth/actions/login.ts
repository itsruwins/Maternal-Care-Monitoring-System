"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CHANGE_PASSWORD_PATH, mustChangePassword } from "@/lib/auth/password-flag";
import { ROLE_HOME } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "../schemas";
import type { LoginFieldErrorCode, LoginState } from "../types";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type AdminClient = ReturnType<typeof createAdminClient>;

// Username + password login.
// Supabase Auth signs in by email, so we look up the email for the username
// on the server (admin client). The browser never sees any email.
export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  // A missing field counts as empty, so the user sees the translated "required" message.
  const typedUsername = String(formData.get("username") ?? "");
  const parsed = loginSchema.safeParse({
    username: typedUsername,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const fields = z.flattenError(parsed.error).fieldErrors;
    return {
      username: typedUsername,
      fieldErrors: {
        username: fields.username?.[0] as LoginFieldErrorCode | undefined,
        password: fields.password?.[0] as LoginFieldErrorCode | undefined,
      },
    };
  }

  const { username, password } = parsed.data;
  const admin = createAdminClient();

  // 1. Locked? (5 failures in the last 15 minutes)
  const since = new Date(Date.now() - LOCK_MINUTES * 60_000).toISOString();
  const { count, error: countError } = await admin
    .from("login_attempt")
    .select("login_attempt_id", { count: "exact", head: true })
    .eq("username", username)
    .gte("attempted_at", since);

  if (countError) return { error: "generic", username: typedUsername };
  if ((count ?? 0) >= MAX_FAILED_ATTEMPTS) {
    return { error: "locked", lockMinutes: LOCK_MINUTES, username: typedUsername };
  }

  // 2. Find the account and its login email.
  const { data: account, error: accountError } = await admin
    .from("user_account")
    .select("user_id, role, account_status")
    .eq("username", username)
    .maybeSingle();

  if (accountError) return { error: "generic", username: typedUsername };

  const email = account
    ? (await admin.auth.admin.getUserById(account.user_id)).data.user?.email
    : undefined;

  if (!account || !email) {
    await recordFailure(admin, username);
    return { error: "invalid", username: typedUsername };
  }

  // 3. Check the password (this also sets the session cookie).
  const supabase = await createClient();
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    if (signInError.code === "invalid_credentials") {
      await recordFailure(admin, username);
      return { error: "invalid", username: typedUsername };
    }
    return { error: "generic", username: typedUsername };
  }

  // 4. Deactivated accounts can't stay logged in.
  if (account.account_status !== "ACTIVE") {
    await supabase.auth.signOut();
    return { error: "inactive", username: typedUsername };
  }

  // 5. Success: clear failures, record the login time.
  await Promise.all([
    admin.from("login_attempt").delete().eq("username", username),
    admin
      .from("user_account")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", account.user_id),
  ]);

  // A default password (new staff account or a reset) must be changed first.
  redirect(mustChangePassword(signIn.user?.app_metadata) ? CHANGE_PASSWORD_PATH : ROLE_HOME[account.role]);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

async function recordFailure(admin: AdminClient, username: string): Promise<void> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  await Promise.all([
    admin.from("login_attempt").insert({ username }),
    // Housekeeping: drop this username's failures older than a day.
    admin.from("login_attempt").delete().eq("username", username).lt("attempted_at", dayAgo),
  ]);
}
