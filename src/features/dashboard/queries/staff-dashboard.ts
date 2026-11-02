import "server-only";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { addDays, daysBetween, DUE_SOON_DAYS, gestationalAge, PREGNANCY_DAYS } from "@/lib/utils/pregnancy";
import type { DashboardCounts, DueSoonItem } from "../types";

// All read as the logged-in staff member (RLS: staff see every record).

/** The due list shows this many; "See all" opens the Mothers list. */
export const DUE_LIST_LIMIT = 8;

const dayStart = (date: string) => `${date}T00:00:00+08:00`;

/** The greeting's first name: from her or his staff profile, else the username. */
export async function getStaffFirstName(user: CurrentUser): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("health_worker").select("first_name").eq("user_id", user.id).maybeSingle();
  return data?.first_name?.trim() || user.username;
}

/** The five counts. `today` is a Manila date. */
export async function getDashboardCounts(today: string): Promise<DashboardCounts> {
  const supabase = await createClient();
  const [todays, requests, followUps, pregnant, dueSoon] = await Promise.all([
    // The same appointments the Visits page lists for today.
    supabase
      .from("appointment")
      .select("appointment_id", { count: "exact", head: true })
      .in("status", ["CONFIRMED", "RESCHEDULED", "MISSED", "COMPLETED"])
      .gte("scheduled_datetime", dayStart(today))
      .lt("scheduled_datetime", dayStart(addDays(today, 1)!)),
    supabase.from("appointment").select("appointment_id", { count: "exact", head: true }).eq("status", "REQUESTED"),
    supabase.from("follow_up_item").select("appointment_id", { count: "exact", head: true }).eq("is_open", true),
    supabase.from("pregnancy").select("pregnancy_id", { count: "exact", head: true }).eq("pregnancy_status", "ACTIVE"),
    supabase
      .from("pregnancy")
      .select("pregnancy_id", { count: "exact", head: true })
      .eq("pregnancy_status", "ACTIVE")
      .lte("expected_delivery_date", dueSoonEnd(today)),
  ]);
  return {
    today: todays.count ?? 0,
    requests: requests.count ?? 0,
    followUps: followUps.count ?? 0,
    pregnant: pregnant.count ?? 0,
    dueSoon: dueSoon.count ?? 0,
  };
}

/** Current pregnancies due within 30 days, past due first, then soonest. */
export async function listDueSoon(today: string): Promise<DueSoonItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pregnancy")
    .select(
      "pregnancy_id, lmp_date, expected_delivery_date, mother:mother_id(mother_id, first_name, middle_name, last_name, purok:purok_id(name))",
    )
    .eq("pregnancy_status", "ACTIVE")
    .lte("expected_delivery_date", dueSoonEnd(today))
    .order("expected_delivery_date")
    .order("pregnancy_id")
    .limit(DUE_LIST_LIMIT);
  return (data ?? []).flatMap((row) => {
    const mother = row.mother;
    if (!mother || !row.expected_delivery_date) return [];
    const lmp = row.lmp_date ?? addDays(row.expected_delivery_date, -PREGNANCY_DAYS);
    return [
      {
        pregnancyId: row.pregnancy_id,
        motherId: mother.mother_id,
        name: [mother.first_name, mother.middle_name, mother.last_name].filter(Boolean).join(" "),
        purok: mother.purok?.name ?? null,
        dueDate: row.expected_delivery_date,
        daysLeft: daysBetween(today, row.expected_delivery_date) ?? 0,
        weeks: lmp ? (gestationalAge(lmp, today)?.weeks ?? null) : null,
      },
    ];
  });
}

/** Due within 30 days = due on or before today + 30 (past due included). */
const dueSoonEnd = (today: string) => addDays(today, DUE_SOON_DAYS)!;
