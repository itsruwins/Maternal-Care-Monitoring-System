"use server";

import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isId, isIdOrNull } from "@/lib/validation/ids";
import { visitSchema } from "../schemas";
import type { RecordVisitResult, VisitErrorKey, VisitField, VisitInput } from "../types";

const DB_ERRORS: VisitErrorKey[] = ["no_active_pregnancy", "aog_out_of_range", "appointment_not_open", "visit_locked", "no_staff_profile"];

// Saves a visit and its services in one step (record_visit, migration 0014).
// The database checks the pregnancy, the appointment and the typo limits again.
export async function recordVisit(input: VisitInput): Promise<RecordVisitResult> {
  await requireRole(AREA_ROLES.staff);
  if (!isId(input?.pregnancyId) || !isIdOrNull(input.appointmentId)) {
    return { ok: false, error: "generic" };
  }
  const parsed = visitSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<VisitField, VisitErrorKey>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as VisitField;
      fieldErrors[field] ??= issue.message as VisitErrorKey;
    }
    return { ok: false, fieldErrors };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { data: visitId, error } = await supabase.rpc("record_visit", {
    p_pregnancy_id: input.pregnancyId,
    p_appointment_id: input.appointmentId,
    p_bp_systolic: data.bpSystolic!,
    p_bp_diastolic: data.bpDiastolic!,
    p_weight_kg: data.weightKg!,
    p_temperature_c: data.temperatureC!,
    p_pulse_rate: data.pulseRate!,
    p_fundal_height_cm: data.fundalHeightCm,
    p_fetal_heart_rate: data.fetalHeartRate,
    p_notes: data.notes,
    p_services: data.services.map((s) => ({ activity_type_id: s.serviceId, dose_or_details: s.details, result_notes: s.resultNotes || null })),
  });
  if (error || !visitId) {
    const code = DB_ERRORS.find((known) => error?.message?.includes(known));
    return { ok: false, error: code ?? "generic" };
  }
  return { ok: true, visitId };
}

// Changes a visit and its services (update_visit, migration 0014): health
// workers only on the day it was recorded, admins any time.
export async function updateVisit(visitId: number, input: Omit<VisitInput, "pregnancyId" | "appointmentId">): Promise<RecordVisitResult> {
  await requireRole(AREA_ROLES.staff);
  if (!isId(visitId)) return { ok: false, error: "generic" };
  const parsed = visitSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<VisitField, VisitErrorKey>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as VisitField;
      fieldErrors[field] ??= issue.message as VisitErrorKey;
    }
    return { ok: false, fieldErrors };
  }
  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_visit", {
    p_visit_id: visitId,
    p_bp_systolic: data.bpSystolic!,
    p_bp_diastolic: data.bpDiastolic!,
    p_weight_kg: data.weightKg!,
    p_temperature_c: data.temperatureC!,
    p_pulse_rate: data.pulseRate!,
    p_fundal_height_cm: data.fundalHeightCm,
    p_fetal_heart_rate: data.fetalHeartRate,
    p_notes: data.notes,
    p_services: data.services.map((s) => ({ activity_type_id: s.serviceId, dose_or_details: s.details, result_notes: s.resultNotes || null })),
  });
  if (error) {
    const code = DB_ERRORS.find((known) => error.message?.includes(known));
    return { ok: false, error: code ?? "generic" };
  }
  return { ok: true, visitId };
}
