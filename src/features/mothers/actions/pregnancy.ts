"use server";

import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { fieldErrorsOf, readFields } from "../form-errors";
import {
  closePregnancySchema,
  currentPregnancySchema,
  pastPregnancySchema,
  statusForOutcome,
  type ClosePregnancyField,
  type CurrentPregnancyField,
  type PastPregnancyField,
} from "../schemas";
import type { FormState } from "../types";

// Pregnancy changes by staff (RLS: health workers and admins may add and update
// pregnancies). The database allows only one ACTIVE pregnancy per mother.

const CURRENT_FIELDS: CurrentPregnancyField[] = ["gravida", "para", "lmp", "edd", "remarks"];
const CLOSE_FIELDS: ClosePregnancyField[] = ["outcome", "outcomeDate", "remarks"];
const PAST_FIELDS: PastPregnancyField[] = ["gravida", "para", "outcome", "outcomeDate", "lmp", "edd", "remarks"];

/** Start a new current pregnancy (pregnancyId = null) or edit the current one. */
export async function saveCurrentPregnancy(
  motherId: number,
  pregnancyId: number | null,
  _previous: FormState<CurrentPregnancyField>,
  formData: FormData,
): Promise<FormState<CurrentPregnancyField>> {
  await requireRole(AREA_ROLES.staff);
  const parsed = currentPregnancySchema.safeParse(readFields(formData, CURRENT_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<CurrentPregnancyField>(parsed.error.issues) };
  const data = parsed.data;
  const values = {
    gravida: data.gravida,
    para: data.para,
    lmp_date: data.lmp || null,
    expected_delivery_date: data.edd,
    remarks: data.remarks || null,
  };

  const supabase = await createClient();
  if (pregnancyId === null) {
    const { error } = await supabase
      .from("pregnancy")
      .insert({ ...values, mother_id: motherId, pregnancy_status: "ACTIVE", registration_date: manilaTodayISO() });
    if (error) return { error: error.code === "23505" ? "alreadyActive" : "generic" };
    return { ok: true };
  }

  const { data: updated, error } = await supabase
    .from("pregnancy")
    .update(values)
    .eq("pregnancy_id", pregnancyId)
    .eq("mother_id", motherId)
    .eq("pregnancy_status", "ACTIVE")
    .select("pregnancy_id");
  return error || !updated?.length ? { error: "generic" } : { ok: true };
}

/** Close the current pregnancy with its outcome. */
export async function closePregnancy(
  motherId: number,
  pregnancyId: number,
  _previous: FormState<ClosePregnancyField>,
  formData: FormData,
): Promise<FormState<ClosePregnancyField>> {
  await requireRole(AREA_ROLES.staff);
  const parsed = closePregnancySchema.safeParse(readFields(formData, CLOSE_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<ClosePregnancyField>(parsed.error.issues) };
  const data = parsed.data;

  const supabase = await createClient();
  const { data: pregnancy } = await supabase
    .from("pregnancy")
    .select("lmp_date, remarks")
    .eq("pregnancy_id", pregnancyId)
    .eq("mother_id", motherId)
    .eq("pregnancy_status", "ACTIVE")
    .maybeSingle();
  if (!pregnancy) return { error: "generic" };
  if (pregnancy.lmp_date && data.outcomeDate < pregnancy.lmp_date) return { fieldErrors: { outcomeDate: "outcomeBeforeLmp" } };

  const { data: updated, error } = await supabase
    .from("pregnancy")
    .update({
      pregnancy_status: statusForOutcome(data.outcome),
      outcome: data.outcome,
      outcome_date: data.outcomeDate,
      remarks: data.remarks || pregnancy.remarks,
    })
    .eq("pregnancy_id", pregnancyId)
    .eq("pregnancy_status", "ACTIVE")
    .select("pregnancy_id");
  return error || !updated?.length ? { error: "generic" } : { ok: true };
}

/** Add (pregnancyId = null) or edit a past pregnancy. */
export async function savePastPregnancy(
  motherId: number,
  pregnancyId: number | null,
  _previous: FormState<PastPregnancyField>,
  formData: FormData,
): Promise<FormState<PastPregnancyField>> {
  await requireRole(AREA_ROLES.staff);
  const parsed = pastPregnancySchema.safeParse(readFields(formData, PAST_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf<PastPregnancyField>(parsed.error.issues) };
  const data = parsed.data;
  const values = {
    gravida: data.gravida,
    para: data.para,
    lmp_date: data.lmp || null,
    expected_delivery_date: data.edd || null,
    pregnancy_status: statusForOutcome(data.outcome),
    outcome: data.outcome,
    outcome_date: data.outcomeDate,
    remarks: data.remarks || null,
  };

  const supabase = await createClient();
  const { data: saved, error } =
    pregnancyId === null
      ? await supabase
          .from("pregnancy")
          .insert({ ...values, mother_id: motherId, registration_date: manilaTodayISO() })
          .select("pregnancy_id")
      : await supabase
          .from("pregnancy")
          .update(values)
          .eq("pregnancy_id", pregnancyId)
          .eq("mother_id", motherId)
          .neq("pregnancy_status", "ACTIVE")
          .select("pregnancy_id");
  return error || !saved?.length ? { error: "generic" } : { ok: true };
}
