"use server";

import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isId } from "@/lib/validation/ids";
import { fieldErrorsOf, readFields } from "../form-errors";
import { motherDetailsSchema, type MotherDetailsField } from "../schemas";
import type { FormState } from "../types";

const FIELDS: MotherDetailsField[] = [
  "firstName",
  "middleName",
  "lastName",
  "dateOfBirth",
  "contactNumber",
  "purokId",
  "street",
  "emergencyName",
  "emergencyNumber",
];

// Any health worker or admin can update any mother's details (RLS allows staff).
export async function updateMotherDetails(
  motherId: number,
  _previous: FormState<MotherDetailsField>,
  formData: FormData,
): Promise<FormState<MotherDetailsField>> {
  await requireRole(AREA_ROLES.staff);
  if (!isId(motherId)) return { error: "generic" };
  const parsed = motherDetailsSchema.safeParse(readFields(formData, FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<MotherDetailsField>(parsed.error.issues) };
  const data = parsed.data;

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("mother")
    .update({
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      contact_number: data.contactNumber,
      purok_id: data.purokId,
      street_address: data.street,
      emergency_contact_name: data.emergencyName,
      emergency_contact_no: data.emergencyNumber,
    })
    .eq("mother_id", motherId)
    .select("mother_id");
  return error || !updated?.length ? { error: "generic" } : { ok: true };
}
