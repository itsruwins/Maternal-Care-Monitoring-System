"use server";

import { isSlotTime, slotErrorOf, slotInstant } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { parseISODate } from "@/lib/utils/pregnancy";
import type { ActionResult } from "../types";

// The mother's own appointment actions. The database checks every rule
// (slots, closed days, window, one per slot, cancel deadline).

export async function requestVisit(input: { serviceId: number; date: string; time: string; note: string }): Promise<ActionResult> {
  const user = await requireRole(AREA_ROLES.mother);
  if (!Number.isInteger(input.serviceId) || !parseISODate(input.date) || !isSlotTime(input.time)) {
    return { ok: false, error: "slot_invalid" };
  }
  const note = input.note.trim().slice(0, 300);

  const supabase = await createClient();
  const { data: mother } = await supabase.from("mother").select("mother_id").eq("user_id", user.id).maybeSingle();
  const { data: pregnancy } = mother
    ? await supabase.from("pregnancy").select("pregnancy_id").eq("mother_id", mother.mother_id).eq("pregnancy_status", "ACTIVE").maybeSingle()
    : { data: null };
  if (!pregnancy) return { ok: false, error: "no_active_pregnancy" };

  const { error } = await supabase.from("appointment").insert({
    pregnancy_id: pregnancy.pregnancy_id,
    activity_type_id: input.serviceId,
    requested_by_user_id: user.id,
    requested_datetime: slotInstant(input.date, input.time),
    status: "REQUESTED",
    remarks: note || null,
  });
  return error ? { ok: false, error: slotErrorOf(error) } : { ok: true };
}

export async function cancelMyAppointment(appointmentId: number): Promise<ActionResult> {
  await requireRole(AREA_ROLES.mother);
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_appointment", { p_appointment_id: appointmentId });
  return error ? { ok: false, error: slotErrorOf(error) } : { ok: true };
}

export async function respondToNewTime(appointmentId: number, accept: boolean): Promise<ActionResult> {
  await requireRole(AREA_ROLES.mother);
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_new_time", { p_appointment_id: appointmentId, p_accept: accept });
  return error ? { ok: false, error: slotErrorOf(error) } : { ok: true };
}
