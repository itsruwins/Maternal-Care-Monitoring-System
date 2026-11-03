"use server";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isId } from "@/lib/validation/ids";

export type RetrySmsResult = { ok: true } | { ok: false; error: "too_late" | "not_failed" | "generic" };

// Retry on a failed text (admins): retry_sms() puts it back in the queue, to
// her current number, and the schedule sends it within 5 minutes.
export async function retrySms(reminderId: number): Promise<RetrySmsResult> {
  await requireRole(["ADMIN"]);
  if (!isId(reminderId)) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("retry_sms", { p_reminder_id: reminderId });
  if (!error) return { ok: true };
  if (error.message === "too_late") return { ok: false, error: "too_late" };
  if (error.message === "not_failed" || error.message === "not_found") return { ok: false, error: "not_failed" };
  return { ok: false, error: "generic" };
}
