import "server-only";
import { MUST_CHANGE_PASSWORD_KEY } from "@/lib/auth/password-flag";
import { placeholderEmail } from "@/lib/auth/placeholder-email";
import { createAdminClient } from "@/lib/supabase/admin";

export type MotherLoginResult =
  | { ok: true; userId: string }
  | { ok: false; field?: "username" | "email"; error: "usernameTaken" | "emailTaken" | "generic" };

// Creates a mother's login: the password is her username, and she must
// choose her own at first login (same as new staff accounts). Uses the secret
// key, so callers must check the staff role first. Linking it to her mother
// record is the caller's job.
export async function createMotherLogin({ username, email }: { username: string; email: string }): Promise<MotherLoginResult> {
  const admin = createAdminClient();

  const { data: existing } = await admin.from("user_account").select("user_id").eq("username", username).maybeSingle();
  if (existing) return { ok: false, field: "username", error: "usernameTaken" };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email || placeholderEmail(username),
    password: username,
    email_confirm: true,
    app_metadata: { [MUST_CHANGE_PASSWORD_KEY]: true },
  });
  if (createError || !created.user) {
    if (createError?.code === "email_exists" || createError?.code === "user_already_exists") {
      return email ? { ok: false, field: "email", error: "emailTaken" } : { ok: false, field: "username", error: "usernameTaken" };
    }
    return { ok: false, error: "generic" };
  }

  const userId = created.user.id;
  const { error: accountError } = await admin
    .from("user_account")
    .insert({ user_id: userId, username, role: "MOTHER", account_status: "ACTIVE" });
  if (accountError) {
    await admin.auth.admin.deleteUser(userId);
    return accountError.code === "23505" ? { ok: false, field: "username", error: "usernameTaken" } : { ok: false, error: "generic" };
  }
  return { ok: true, userId };
}

// Undo createMotherLogin (when a later step fails). Unlink her record first if
// it was already linked.
export async function removeMotherLogin(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("user_account").delete().eq("user_id", userId);
  await admin.auth.admin.deleteUser(userId);
}
