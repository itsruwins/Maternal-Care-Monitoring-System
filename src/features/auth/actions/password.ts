"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPlaceholderEmail } from "@/lib/auth/placeholder-email";
import { ROLE_HOME } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas";
import type { ForgotPasswordState, ResetPasswordState } from "../types";

// "Forgot password": accepts a username or an email. Always answers the same
// way, so it never reveals whether an account exists or has an email.
// Accounts with only a placeholder email get nothing sent: a health worker resets them.
export async function requestPasswordReset(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ identifier: String(formData.get("identifier") ?? "") });
  if (!parsed.success) return { error: "required" };

  const identifier = parsed.data.identifier.toLowerCase();
  const email = identifier.includes("@") ? identifier : await emailForUsername(identifier);

  if (email && !isPlaceholderEmail(email)) {
    const origin = await requestOrigin();
    const supabase = await createClient();
    // The link opens /auth/callback, which signs the user in and continues to /reset-password.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
  }

  return { sent: true };
}

// Set a new password for the user signed in through the reset link.
export async function updatePassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: issue.message as ResetPasswordState["error"],
      field: issue.path[0] as ResetPasswordState["field"],
    };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "expired" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "generic" };

  redirect(ROLE_HOME[user.role]);
}

async function emailForUsername(username: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("user_account")
    .select("user_id, account_status")
    .eq("username", username)
    .maybeSingle();
  if (!account || account.account_status !== "ACTIVE") return null;
  const { data } = await admin.auth.admin.getUserById(account.user_id);
  return data.user?.email ?? null;
}

// Where the reset link points. Prefer the configured site URL (production);
// Supabase also rejects any redirect not on its allowed list.
async function requestOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
