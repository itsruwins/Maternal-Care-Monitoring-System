import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";
import { MUST_CHANGE_PASSWORD_KEY } from "./password-flag";

export type ResetToDefaultResult = { ok: true; username: string } | { ok: false; error: "notFound" | "usernameTooShort" | "generic" };

/**
 * Puts a login's password back to the default (its username) and forces a
 * change at the next login. Also clears any login lockout for that username,
 * and adds a "Your password was reset" notification for the owner.
 * Uses the secret key: callers MUST check the caller's role first
 * (admins: any account; health workers: mothers only). Pass `onlyRole` when
 * the target must be that kind of login (a mother's record resets only a
 * MOTHER login, whatever the record points at).
 */
export async function resetPasswordToDefault(userId: string, onlyRole?: UserRole): Promise<ResetToDefaultResult> {
  const admin = createAdminClient();
  const { data: account, error } = await admin
    .from("user_account")
    .select("username, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { ok: false, error: "generic" };
  if (!account || (onlyRole && account.role !== onlyRole)) return { ok: false, error: "notFound" };
  // Older usernames (before the 8-character rule) are too short to be a password.
  if (account.username.length < 8) return { ok: false, error: "usernameTooShort" };

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password: account.username,
    app_metadata: { [MUST_CHANGE_PASSWORD_KEY]: true },
  });
  if (updateError) return { ok: false, error: "generic" };

  await admin.from("login_attempt").delete().eq("username", account.username);
  // Tell the owner in their notification bell (a failure here never undoes the reset).
  await admin.rpc("notify_password_reset", { p_user_id: userId });
  return { ok: true, username: account.username };
}
