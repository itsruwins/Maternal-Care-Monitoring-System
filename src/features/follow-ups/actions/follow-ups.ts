"use server";

import type { z } from "zod";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isId } from "@/lib/validation/ids";
import { followUpSchema, type FollowUpField, type FollowUpValues } from "../schemas";
import type { FollowUpActionResult, FollowUpErrorKey } from "../types";

// Staff log and change follow-ups; only admins delete them. The database
// fills in who logged it and checks the rules again (migration 0015).

type Parsed = { ok: true; row: ReturnType<typeof toRow> } | { ok: false; fieldErrors: Partial<Record<FollowUpField, FollowUpErrorKey>> };

function toRow(data: z.output<typeof followUpSchema>) {
  return { follow_up_date: data.date, method: data.method, result: data.result, outcome_notes: data.notes, close_reason: data.closeReason };
}

function parse(values: FollowUpValues): Parsed {
  const parsed = followUpSchema.safeParse(values);
  if (parsed.success) return { ok: true, row: toRow(parsed.data) };
  const fieldErrors: Partial<Record<FollowUpField, FollowUpErrorKey>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as FollowUpField;
    fieldErrors[field] ??= issue.message as FollowUpErrorKey;
  }
  return { ok: false, fieldErrors };
}

/** The database's error codes, on the field they belong to where there is one. */
function failure(error: { message?: string } | null): FollowUpActionResult {
  const message = error?.message ?? "";
  const onField: [FollowUpErrorKey, FollowUpField][] = [
    ["follow_up_date_future", "date"],
    ["follow_up_date_early", "date"],
    ["close_note_required", "notes"],
    ["result_required", "result"],
  ];
  const field = onField.find(([code]) => message.includes(code));
  if (field) return { ok: false, fieldErrors: { [field[1]]: field[0] } };
  const general: FollowUpErrorKey[] = ["appointment_not_missed", "no_staff_profile", "follow_up_locked"];
  return { ok: false, error: general.find((code) => message.includes(code)) ?? "generic" };
}

export async function logFollowUp(appointmentId: number, values: FollowUpValues): Promise<FollowUpActionResult> {
  await requireRole(AREA_ROLES.staff);
  if (!isId(appointmentId)) return { ok: false, error: "generic" };
  const parsed = parse(values);
  if (!parsed.ok) return parsed;
  const supabase = await createClient();
  const { error } = await supabase.from("follow_up").insert({ appointment_id: appointmentId, ...parsed.row });
  return error ? failure(error) : { ok: true };
}

/** Health workers only on the day it was logged; admins any time. */
export async function updateFollowUp(followUpId: number, values: FollowUpValues): Promise<FollowUpActionResult> {
  await requireRole(AREA_ROLES.staff);
  if (!isId(followUpId)) return { ok: false, error: "generic" };
  const parsed = parse(values);
  if (!parsed.ok) return parsed;
  const supabase = await createClient();
  const { data, error } = await supabase.from("follow_up").update(parsed.row).eq("follow_up_id", followUpId).select("follow_up_id");
  if (error) return failure(error);
  return data?.length ? { ok: true } : { ok: false, error: "not_found" };
}

export async function deleteFollowUp(followUpId: number): Promise<FollowUpActionResult> {
  await requireRole(AREA_ROLES.admin);
  if (!isId(followUpId)) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("follow_up").delete().eq("follow_up_id", followUpId).select("follow_up_id");
  if (error) return failure(error);
  return data?.length ? { ok: true } : { ok: false, error: "not_found" };
}
