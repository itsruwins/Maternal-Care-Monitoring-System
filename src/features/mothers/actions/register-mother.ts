"use server";

import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { registerMotherSchema, type RegisterMotherField } from "../schemas";
import { createMotherLogin, removeMotherLogin } from "../server/mother-login";
import type { FormState, MotherErrorKey, RegisteredMother } from "../types";

const FIELDS: RegisterMotherField[] = [
  "firstName",
  "middleName",
  "lastName",
  "dateOfBirth",
  "contactNumber",
  "purokId",
  "street",
  "emergencyName",
  "emergencyNumber",
  "gravida",
  "para",
  "lmp",
  "edd",
  "createLogin",
  "username",
  "email",
];

export type RegisterMotherState = FormState<RegisterMotherField> & { registered?: RegisteredMother };

/** A name typed into an exact, case-insensitive match (no wildcards). */
const exactLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

// A health worker (or admin) registers a mother at the health center: her
// record, her current pregnancy and, if ticked, a login. Every step is undone
// if a later one fails, so nothing half-made is left behind.
export async function registerMotherAtCenter(
  _previous: RegisterMotherState,
  formData: FormData,
): Promise<RegisterMotherState> {
  await requireRole(AREA_ROLES.staff);

  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = registerMotherSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: RegisterMotherState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as RegisterMotherField;
      fieldErrors[field] ??= issue.message as MotherErrorKey;
    }
    return { fieldErrors };
  }
  const data = parsed.data;
  const supabase = await createClient();

  // Already registered (e.g. she signed up on the website)?
  const { data: twins } = await supabase
    .from("mother")
    .select("mother_id")
    .ilike("first_name", exactLike(data.firstName))
    .ilike("last_name", exactLike(data.lastName))
    .eq("date_of_birth", data.dateOfBirth)
    .limit(1);
  if (twins?.length) return { error: "duplicate" };

  const { data: healthWorkerId } = await supabase.rpc("current_health_worker_id");

  // 1. Her login (optional).
  let userId: string | null = null;
  if (data.createLogin) {
    const login = await createMotherLogin({ username: data.username, email: data.email });
    if (!login.ok) return login.field ? { fieldErrors: { [login.field]: login.error } } : { error: login.error };
    userId = login.userId;
  }
  const undoLogin = async () => {
    if (userId) await removeMotherLogin(userId);
  };

  // 2. Her record.
  const today = manilaTodayISO();
  const { data: mother, error: motherError } = await supabase
    .from("mother")
    .insert({
      user_id: userId,
      registered_by: healthWorkerId ?? null,
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      purok_id: data.purokId,
      street_address: data.street,
      contact_number: data.contactNumber,
      emergency_contact_name: data.emergencyName,
      emergency_contact_no: data.emergencyNumber,
      registration_date: today,
    })
    .select("mother_id")
    .single();
  if (motherError || !mother) {
    await undoLogin();
    return { error: "generic" };
  }

  // 3. Her current pregnancy.
  const { error: pregnancyError } = await supabase.from("pregnancy").insert({
    mother_id: mother.mother_id,
    gravida: data.gravida,
    para: data.para,
    lmp_date: data.lmp || null,
    expected_delivery_date: data.edd,
    pregnancy_status: "ACTIVE",
    registration_date: today,
  });
  if (pregnancyError) {
    // Health workers can't delete mothers (RLS), so the undo uses the secret key.
    await createAdminClient().from("mother").delete().eq("mother_id", mother.mother_id);
    await undoLogin();
    return { error: "generic" };
  }

  return {
    ok: true,
    registered: {
      motherId: mother.mother_id,
      name: [data.firstName, data.lastName].join(" "),
      username: data.createLogin ? data.username : null,
    },
  };
}
