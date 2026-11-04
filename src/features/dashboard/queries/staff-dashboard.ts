import "server-only";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { addDays, daysBetween, DUE_SOON_DAYS, gestationalAge, parseISODate, PREGNANCY_DAYS } from "@/lib/utils/pregnancy";
import type { DashboardContext, DashboardCounts, DueSoonItem, FollowUpItem, RequestItem, VisitDay } from "../types";

// All read as the logged-in staff member (RLS: staff see every record).

/** The due list shows this many; "See all" opens the Mothers list. */
export const DUE_LIST_LIMIT = 8;
/** "Needs attention" shows this many of each kind; the rest are on their page. */
export const ATTENTION_LIMIT = 3;
/** The visits chart covers today and the 29 days before it. */
export const CHART_DAYS = 30;
/** 28 weeks or more = due within 12 weeks (84 days). */
const THIRD_TRIMESTER_DAYS = PREGNANCY_DAYS - 28 * 7;

type NameParts = { first_name: string; middle_name: string | null; last_name: string };
const fullName = (m: NameParts) => [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(" ");

const dayStart = (date: string) => `${date}T00:00:00+08:00`;

/** The greeting's first name: from her or his staff profile, else the username. */
export async function getStaffFirstName(user: CurrentUser): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("health_worker").select("first_name").eq("user_id", user.id).maybeSingle();
  return data?.first_name?.trim() || user.username;
}

/** The five counts and the line under each. `today` is a Manila date. */
export async function getDashboardCounts(today: string): Promise<{ counts: DashboardCounts; context: DashboardContext }> {
  const supabase = await createClient();
  const todayRange = (status: "COMPLETED" | "MISSED") =>
    supabase
      .from("appointment")
      .select("appointment_id", { count: "exact", head: true })
      .eq("status", status)
      .gte("scheduled_datetime", dayStart(today))
      .lt("scheduled_datetime", dayStart(addDays(today, 1)!));
  const activeDueBy = (end: string, inclusive = true) => {
    const query = supabase.from("pregnancy").select("pregnancy_id", { count: "exact", head: true }).eq("pregnancy_status", "ACTIVE");
    return inclusive ? query.lte("expected_delivery_date", end) : query.lt("expected_delivery_date", end);
  };
  const [todays, requests, followUps, pregnant, dueSoon, done, missed, earliest, oldest, third, pastDue] = await Promise.all([
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
    todayRange("COMPLETED"),
    todayRange("MISSED"),
    supabase
      .from("appointment")
      .select("created_at")
      .eq("status", "REQUESTED")
      .order("created_at")
      .limit(1)
      .maybeSingle(),
    supabase.from("follow_up_item").select("missed_at").eq("is_open", true).order("missed_at").limit(1).maybeSingle(),
    activeDueBy(addDays(today, THIRD_TRIMESTER_DAYS)!),
    activeDueBy(today, false),
  ]);
  return {
    counts: {
      today: todays.count ?? 0,
      requests: requests.count ?? 0,
      followUps: followUps.count ?? 0,
      pregnant: pregnant.count ?? 0,
      dueSoon: dueSoon.count ?? 0,
    },
    context: {
      todayDone: done.count ?? 0,
      todayMissed: missed.count ?? 0,
      oldestRequestAt: earliest.data?.created_at ?? null,
      oldestMissedAt: oldest.data?.missed_at ?? null,
      thirdTrimester: third.count ?? 0,
      pastDue: pastDue.count ?? 0,
    },
  };
}

/** Waiting requests, first come first served (as on the Requests tab). */
export async function listWaitingRequests(): Promise<RequestItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointment")
    .select("appointment_id, scheduled_datetime, activity_type:activity_type_id(name), pregnancy:pregnancy_id(mother:mother_id(mother_id, first_name, middle_name, last_name))")
    .eq("status", "REQUESTED")
    .order("created_at")
    .order("appointment_id")
    .limit(ATTENTION_LIMIT);
  return (data ?? []).flatMap((row) => {
    const mother = row.pregnancy?.mother;
    if (!mother || !row.scheduled_datetime) return [];
    return [
      {
        appointmentId: row.appointment_id,
        motherId: mother.mother_id,
        name: fullName(mother),
        service: row.activity_type?.name ?? "",
        at: row.scheduled_datetime,
      },
    ];
  });
}

/** Open missed visits, oldest first (as on the Follow-ups page). */
export async function listOpenFollowUps(): Promise<FollowUpItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follow_up_item")
    .select("appointment_id, mother_id, service, missed_at, first_name, middle_name, last_name")
    .eq("is_open", true)
    .order("missed_at")
    .order("appointment_id")
    .limit(ATTENTION_LIMIT);
  return (data ?? []).map((row) => ({
    appointmentId: row.appointment_id,
    motherId: row.mother_id,
    name: fullName(row),
    service: row.service,
    missedAt: row.missed_at,
  }));
}

/**
 * Completed visits per day for the last 30 days, oldest first: every clinic
 * day (Monday to Friday), plus a weekend day only when it had a visit.
 */
export async function listVisitsByDay(today: string): Promise<VisitDay[]> {
  const supabase = await createClient();
  const first = addDays(today, -(CHART_DAYS - 1))!;
  const counts = new Map<string, number>();
  const PAGE = 1000; // Supabase returns at most 1,000 rows per request.
  for (let start = 0; ; start += PAGE) {
    const { data, error } = await supabase
      .from("prenatal_visit")
      .select("visit_id, visit_datetime")
      .gte("visit_datetime", dayStart(first))
      .lt("visit_datetime", dayStart(addDays(today, 1)!))
      .order("visit_id")
      .range(start, start + PAGE - 1);
    if (error) throw new Error("Visits chart read failed", { cause: error });
    for (const row of data ?? []) {
      const day = manilaTodayISO(new Date(row.visit_datetime));
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    if (!data || data.length < PAGE) break;
  }
  const days: VisitDay[] = [];
  for (let i = 0; i < CHART_DAYS; i++) {
    const date = addDays(first, i)!;
    const weekday = parseISODate(date)!.getUTCDay();
    const count = counts.get(date) ?? 0;
    if ((weekday !== 0 && weekday !== 6) || count > 0) days.push({ date, count });
  }
  return days;
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
        name: fullName(mother),
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
