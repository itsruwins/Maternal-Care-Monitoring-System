"use server";

import { MUST_CHANGE_PASSWORD_KEY } from "@/lib/auth/password-flag";
import { placeholderEmail } from "@/lib/auth/placeholder-email";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaffSchema, positionValue } from "../schemas";
import type { AccountErrorKey, CreateStaffField, FormState } from "../types";

const FIELDS: CreateStaffField[] = [
  "role",
  "username",
  "firstName",
  "middleName",
  "lastName",
  "position",
  "positionOther",
  "contactNumber",
  "email",
];

// Admin creates a Health Worker or Admin login + its staff profile.
// The default password is the username; the person must change it at first login.
// Uses the secret key (creating logins), only after the admin check.
export async function createStaffAccount(
  _previous: FormState<CreateStaffField>,
  formData: FormData,
): Promise<FormState<CreateStaffField>> {
  await requireRole(["ADMIN"]);

  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = createStaffSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FormState<CreateStaffField>["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as CreateStaffField;
      fieldErrors[field] ??= issue.message as AccountErrorKey;
    }
    return { fieldErrors };
  }
  const data = parsed.data;
  const admin = createAdminClient();

  const { data: existing } = await admin.from("user_account").select("user_id").eq("username", data.username).maybeSingle();
  if (existing) return { fieldErrors: { username: "usernameTaken" } };

  // 1. The login itself.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: data.email || placeholderEmail(data.username),
    password: data.username,
    email_confirm: true,
    app_metadata: { [MUST_CHANGE_PASSWORD_KEY]: true },
  });
  if (createError || !created.user) {
    if (createError?.code === "email_exists" || createError?.code === "user_already_exists") {
      return data.email ? { fieldErrors: { email: "emailTaken" } } : { fieldErrors: { username: "usernameTaken" } };
    }
    return { error: "generic" };
  }
  const userId = created.user.id;

  // 2. The account row, then 3. the staff profile. Undo the login if either fails.
  const { error: accountError } = await admin
    .from("user_account")
    .insert({ user_id: userId, username: data.username, role: data.role, account_status: "ACTIVE" });
  if (accountError) {
    await admin.auth.admin.deleteUser(userId);
    return accountError.code === "23505" ? { fieldErrors: { username: "usernameTaken" } } : { error: "generic" };
  }

  const { error: staffError } = await admin.from("health_worker").insert({
    user_id: userId,
    first_name: data.firstName,
    middle_name: data.middleName || null,
    last_name: data.lastName,
    position: positionValue(data),
    contact_number: data.contactNumber,
  });
  if (staffError) {
    await admin.from("user_account").delete().eq("user_id", userId);
    await admin.auth.admin.deleteUser(userId);
    return { error: "generic" };
  }

  return { ok: true, username: data.username };
}
