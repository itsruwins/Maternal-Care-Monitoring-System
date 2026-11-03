"use server";

import { AREA_ROLES } from "@/lib/auth/roles";
import { resetPasswordToDefault } from "@/lib/auth/reset-to-default";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AccountStatus } from "@/types/database";
import { isId } from "@/lib/validation/ids";
import { fieldErrorsOf, readFields } from "../form-errors";
import { loginSchema, type LoginField } from "../schemas";
import { createMotherLogin, removeMotherLogin } from "../server/mother-login";
import type { FormState, MotherActionResult } from "../types";

// Login actions on a mother's record, for health workers and admins. They act
// on the login linked to that mother record, so staff logins can't be touched
// from here.

async function linkedUserId(motherId: number): Promise<string | null> {
  if (!isId(motherId)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("mother").select("user_id").eq("mother_id", motherId).maybeSingle();
  return data?.user_id ?? null;
}

export type CreateLoginState = FormState<LoginField> & { username?: string };

/** Give a mother without a login one (username = temporary password). */
export async function createLoginForMother(
  motherId: number,
  _previous: CreateLoginState,
  formData: FormData,
): Promise<CreateLoginState> {
  await requireRole(AREA_ROLES.staff);
  if (!isId(motherId)) return { error: "generic" };
  const parsed = loginSchema.safeParse(readFields(formData, ["username", "email"] as const));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<LoginField>(parsed.error.issues) };

  const supabase = await createClient();
  const { data: mother } = await supabase.from("mother").select("user_id").eq("mother_id", motherId).maybeSingle();
  if (!mother) return { error: "generic" };
  if (mother.user_id) return { error: "hasLogin" };

  const login = await createMotherLogin(parsed.data);
  if (!login.ok) return login.field ? { fieldErrors: { [login.field]: login.error } } : { error: login.error };

  const { data: linked, error } = await supabase
    .from("mother")
    .update({ user_id: login.userId })
    .eq("mother_id", motherId)
    .is("user_id", null)
    .select("mother_id");
  if (error || !linked?.length) {
    await removeMotherLogin(login.userId);
    return { error: "generic" };
  }
  return { ok: true, username: parsed.data.username };
}

/** Put her password back to her username (she must change it at next login). */
export async function resetMotherPassword(motherId: number): Promise<MotherActionResult> {
  await requireRole(AREA_ROLES.staff);
  const userId = await linkedUserId(motherId);
  if (!userId) return { ok: false, error: "generic" };
  const result = await resetPasswordToDefault(userId, "MOTHER");
  if (result.ok) return { ok: true, username: result.username };
  return { ok: false, error: result.error === "usernameTooShort" ? "usernameTooShort" : "generic" };
}

/** Activate or deactivate her login (her records stay either way). */
export async function setMotherLoginStatus(motherId: number, status: AccountStatus): Promise<MotherActionResult> {
  await requireRole(AREA_ROLES.staff);
  if (status !== "ACTIVE" && status !== "INACTIVE") return { ok: false, error: "generic" };
  const userId = await linkedUserId(motherId);
  if (!userId) return { ok: false, error: "generic" };

  // Health workers can't update login accounts (RLS), so this uses the secret
  // key, limited to the MOTHER login linked to this record.
  const { data, error } = await createAdminClient()
    .from("user_account")
    .update({ account_status: status })
    .eq("user_id", userId)
    .eq("role", "MOTHER")
    .select("user_id");
  return error || !data?.length ? { ok: false, error: "generic" } : { ok: true };
}
