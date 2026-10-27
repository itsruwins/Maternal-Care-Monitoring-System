"use server";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { parseISODate } from "@/lib/utils/pregnancy";
import { closedDaySchema } from "../schemas";
import type { ClosedDayErrorKey, ClosedDayFormState } from "../types";

// Admin marks a date closed (today or later, weekdays only).
export async function addClosedDay(_previous: ClosedDayFormState, formData: FormData): Promise<ClosedDayFormState> {
  await requireRole(["ADMIN"]);
  const parsed = closedDaySchema.safeParse({ date: String(formData.get("date") ?? ""), reason: String(formData.get("reason") ?? "") });
  if (!parsed.success) {
    const fieldErrors: ClosedDayFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "date" | "reason";
      fieldErrors[field] ??= issue.message as ClosedDayErrorKey;
    }
    return { fieldErrors };
  }
  const { date, reason } = parsed.data;
  if (date < manilaTodayISO()) return { fieldErrors: { date: "pastDate" } };
  const weekday = parseISODate(date)!.getUTCDay();
  if (weekday === 0 || weekday === 6) return { fieldErrors: { date: "weekend" } };

  const supabase = await createClient();
  const { error } = await supabase.from("closed_day").insert({ closed_date: date, reason });
  if (error) return error.code === "23505" ? { fieldErrors: { date: "taken" } } : { error: "generic" };
  return { ok: true, date };
}

// Open a future closed day again.
export async function removeClosedDay(date: string): Promise<{ ok: boolean }> {
  await requireRole(["ADMIN"]);
  if (!parseISODate(date) || date < manilaTodayISO()) return { ok: false };
  const supabase = await createClient();
  const { data, error } = await supabase.from("closed_day").delete().eq("closed_date", date).select("closed_date");
  return { ok: !error && Boolean(data?.length) };
}
