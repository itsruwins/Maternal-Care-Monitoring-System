"use server";

import { sendSoon } from "@/features/sms/server/send-soon";
import { isSlotTime, slotErrorOf, slotInstant } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { parseISODate } from "@/lib/utils/pregnancy";
import type { ActionResult } from "../types";

// Staff appointment actions. The database checks the slot rules and keeps the
// SMS reminder queue in step (migration 0009); the text her answer or change
// queues is sent right away (sendSoon), not on the next 5-minute run.

type Client = Awaited<ReturnType<typeof createClient>>;

/** Adds a staff remark under any earlier note. */
function withRemark(existing: string | null, remark: string): string | null {
  const text = remark.trim().slice(0, 300);
  if (!text) return existing;
  return existing ? `${existing}\n${text}` : text;
}

async function load(supabase: Client, id: number) {
  const { data } = await supabase
    .from("appointment")
    .select("appointment_id, status, requested_datetime, remarks, pregnancy:pregnancy_id(mother:mother_id(user_id))")
    .eq("appointment_id", id)
    .maybeSingle();
  return data;
}

async function reviewer(supabase: Client): Promise<number | null> {
  const { data } = await supabase.rpc("current_health_worker_id");
  return data ?? null;
}

/** Confirm a request at the time she asked for. */
export async function confirmRequest(id: number): Promise<ActionResult> {
  await requireRole(AREA_ROLES.staff);
  const supabase = await createClient();
  const appointment = await load(supabase, id);
  if (!appointment || appointment.status !== "REQUESTED") return { ok: false, error: "not_found" };

  const { data, error } = await supabase
    .from("appointment")
    .update({ status: "CONFIRMED", scheduled_datetime: appointment.requested_datetime, reviewed_by: await reviewer(supabase) })
    .eq("appointment_id", id)
    .eq("status", "REQUESTED")
    .select("appointment_id");
  if (error) return { ok: false, error: slotErrorOf(error) };
  if (!data?.length) return { ok: false, error: "not_found" };
  sendSoon();
  return { ok: true, status: "CONFIRMED" };
}

/**
 * Offer another time. She must accept it (RESCHEDULED); a mother without a
 * login can't answer in the app, so hers is confirmed right away.
 */
export async function proposeNewTime(id: number, input: { date: string; time: string; remark: string }): Promise<ActionResult> {
  await requireRole(AREA_ROLES.staff);
  if (!parseISODate(input.date) || !isSlotTime(input.time)) return { ok: false, error: "slot_invalid" };
  const supabase = await createClient();
  const appointment = await load(supabase, id);
  if (!appointment || !["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(appointment.status)) return { ok: false, error: "not_found" };

  const status = appointment.pregnancy?.mother?.user_id ? "RESCHEDULED" : "CONFIRMED";
  const { data, error } = await supabase
    .from("appointment")
    .update({
      status,
      scheduled_datetime: slotInstant(input.date, input.time),
      reviewed_by: await reviewer(supabase),
      remarks: withRemark(appointment.remarks, input.remark),
    })
    .eq("appointment_id", id)
    .eq("status", appointment.status)
    .select("appointment_id");
  if (error) return { ok: false, error: slotErrorOf(error) };
  if (!data?.length) return { ok: false, error: "not_found" };
  sendSoon();
  return { ok: true, status };
}

export async function cancelAppointment(id: number, remark: string): Promise<ActionResult> {
  await requireRole(AREA_ROLES.staff);
  const supabase = await createClient();
  const appointment = await load(supabase, id);
  if (!appointment || !["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(appointment.status)) return { ok: false, error: "not_found" };

  const { data, error } = await supabase
    .from("appointment")
    .update({ status: "CANCELLED", reviewed_by: await reviewer(supabase), remarks: withRemark(appointment.remarks, remark) })
    .eq("appointment_id", id)
    .eq("status", appointment.status)
    .select("appointment_id");
  if (error) return { ok: false, error: slotErrorOf(error) };
  if (!data?.length) return { ok: false, error: "not_found" };
  sendSoon();
  return { ok: true, status: "CANCELLED" };
}

/** Book directly for a mother's current pregnancy (starts CONFIRMED). */
export async function bookAppointment(input: {
  pregnancyId: number;
  serviceId: number;
  date: string;
  time: string;
  remark: string;
}): Promise<ActionResult> {
  const user = await requireRole(AREA_ROLES.staff);
  if (!Number.isInteger(input.pregnancyId) || !Number.isInteger(input.serviceId) || !parseISODate(input.date) || !isSlotTime(input.time)) {
    return { ok: false, error: "slot_invalid" };
  }
  const supabase = await createClient();
  const at = slotInstant(input.date, input.time);
  const { error } = await supabase.from("appointment").insert({
    pregnancy_id: input.pregnancyId,
    activity_type_id: input.serviceId,
    requested_by_user_id: user.id,
    reviewed_by: await reviewer(supabase),
    requested_datetime: at,
    scheduled_datetime: at,
    status: "CONFIRMED",
    remarks: withRemark(null, input.remark),
  });
  return error ? { ok: false, error: slotErrorOf(error) } : { ok: true, status: "CONFIRMED" };
}
