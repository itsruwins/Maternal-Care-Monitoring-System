"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  motherDetailsSchema,
  recoveryEmailSchema,
  staffDetailsSchema,
  type DetailsField,
  type PasswordField,
} from "../schemas";
import type { ProfileErrorKey, ProfileFormState } from "../types";

const ANY_ROLE = ["ADMIN", "HEALTH_WORKER", "MOTHER"] as const;

function fieldErrorsOf<Field extends string>(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Partial<Record<Field, ProfileErrorKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0] as Field;
    fieldErrors[field] ??= issue.message as ProfileErrorKey;
  }
  return fieldErrors;
}

// Your own details. Staff: name + mobile (position is admin-only, enforced by
// migration 0007). Mothers: name, mobile, address and emergency contact
// (migration 0005 guards the rest). Uses the person's own session (RLS).
export async function updateMyDetails(
  _previous: ProfileFormState<DetailsField>,
  formData: FormData,
): Promise<ProfileFormState<DetailsField>> {
  const user = await requireRole(ANY_ROLE);
  const read = (field: string) => String(formData.get(field) ?? "");
  const supabase = await createClient();

  if (user.role === "MOTHER") {
    const parsed = motherDetailsSchema.safeParse({
      firstName: read("firstName"),
      middleName: read("middleName"),
      lastName: read("lastName"),
      contactNumber: read("contactNumber"),
      purok: read("purok"),
      street: read("street"),
      emergencyName: read("emergencyName"),
      emergencyNumber: read("emergencyNumber"),
    });
    if (!parsed.success) return { fieldErrors: fieldErrorsOf<DetailsField>(parsed.error.issues) };
    const data = parsed.data;
    const { data: updated, error } = await supabase
      .from("mother")
      .update({
        first_name: data.firstName,
        middle_name: data.middleName || null,
        last_name: data.lastName,
        contact_number: data.contactNumber,
        purok_sitio: data.purok,
        street_address: data.street,
        emergency_contact_name: data.emergencyName,
        emergency_contact_no: data.emergencyNumber,
      })
      .eq("user_id", user.id)
      .select("mother_id");
    return error || !updated?.length ? { error: "generic" } : { ok: true };
  }

  const parsed = staffDetailsSchema.safeParse({
    firstName: read("firstName"),
    middleName: read("middleName"),
    lastName: read("lastName"),
    contactNumber: read("contactNumber"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<DetailsField>(parsed.error.issues) };
  const data = parsed.data;
  const { data: updated, error } = await supabase
    .from("health_worker")
    .update({
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      contact_number: data.contactNumber,
    })
    .eq("user_id", user.id)
    .select("health_worker_id");
  return error || !updated?.length ? { error: "generic" } : { ok: true };
}

// Change your password: the current one is checked first.
export async function changeMyPassword(
  _previous: ProfileFormState<PasswordField>,
  formData: FormData,
): Promise<ProfileFormState<PasswordField>> {
  const user = await requireRole(ANY_ROLE);
  const parsed = changePasswordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<PasswordField>(parsed.error.issues) };
  const { current, password } = parsed.data;
  if (password.trim().toLowerCase() === user.username) return { fieldErrors: { password: "sameAsUsername" } };
  if (password === current) return { fieldErrors: { password: "samePassword" } };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const email = auth.user?.email;
  if (!email) return { error: "generic" };

  // Check the current password with a separate, throwaway client, so the
  // person's own session isn't touched; then end that extra session.
  const checker = createPlainClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error: checkError } = await checker.auth.signInWithPassword({ email, password: current });
  if (checkError) return { fieldErrors: { current: "currentWrong" } };
  await checker.auth.signOut({ scope: "local" });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.code === "same_password" ? "samePassword" : "generic" };
  return { ok: true };
}

// Add or change your recovery email. Email confirmation is off for this
// project, so it's saved directly (with the secret key, for your own login only).
export async function changeMyEmail(
  _previous: ProfileFormState<"email">,
  formData: FormData,
): Promise<ProfileFormState<"email">> {
  const user = await requireRole(ANY_ROLE);
  const parsed = recoveryEmailSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) return { fieldErrors: { email: "emailInvalid" } };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, { email: parsed.data.email, email_confirm: true });
  if (error) {
    return error.code === "email_exists" || error.code === "user_already_exists"
      ? { fieldErrors: { email: "emailTaken" } }
      : { error: "generic" };
  }
  return { ok: true };
}
