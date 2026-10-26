"use server";

import { resetPasswordToDefault } from "@/lib/auth/reset-to-default";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AccountStatus } from "@/types/database";
import { positionValue, staffProfileSchema } from "../schemas";
import type { AccountErrorKey, ActionResult, FormState, StaffField } from "../types";

// Admin actions on one account. Admins can't change their own account here
// (they use their Profile page), so they can't lock themselves out.

export async function setAccountStatus(userId: string, status: AccountStatus): Promise<ActionResult> {
  const me = await requireRole(["ADMIN"]);
  if (userId === me.id) return { ok: false, error: "self" };
  if (status !== "ACTIVE" && status !== "INACTIVE") return { ok: false, error: "generic" };

  const supabase = await createClient();
  const { error } = await supabase.from("user_account").update({ account_status: status }).eq("user_id", userId);
  return error ? { ok: false, error: "generic" } : { ok: true };
}

export async function resetAccountPassword(userId: string): Promise<ActionResult> {
  const me = await requireRole(["ADMIN"]);
  if (userId === me.id) return { ok: false, error: "self" };

  const result = await resetPasswordToDefault(userId);
  if (result.ok) return { ok: true, username: result.username };
  return { ok: false, error: result.error === "usernameTooShort" ? "usernameTooShort" : "generic" };
}

const STAFF_FIELDS: StaffField[] = ["firstName", "middleName", "lastName", "position", "positionOther", "contactNumber"];

export async function updateStaffProfile(
  userId: string,
  _previous: FormState<StaffField>,
  formData: FormData,
): Promise<FormState<StaffField>> {
  const me = await requireRole(["ADMIN"]);
  if (userId === me.id) return { error: "self" };

  const raw = Object.fromEntries(STAFF_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = staffProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FormState<StaffField>["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as StaffField;
      fieldErrors[field] ??= issue.message as AccountErrorKey;
    }
    return { fieldErrors };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("health_worker")
    .update({
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      position: positionValue(data),
      contact_number: data.contactNumber,
    })
    .eq("user_id", userId)
    .select("health_worker_id");
  if (error || !updated?.length) return { error: "generic" };
  return { ok: true };
}
