import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDays } from "@/lib/utils/pregnancy";
import type { ClosedDay } from "../types";

const PAST_SHOWN = 10;

/** "YYYY-MM-DD" in Manila for a timestamp. */
const manilaDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

// Upcoming closed days (with how many appointments are still booked on each)
// and the most recent past ones. Admins only (the page checks the role).
export async function listClosedDays(today: string): Promise<{ upcoming: ClosedDay[]; past: ClosedDay[] }> {
  const supabase = await createClient();
  const [{ data: upcomingRows }, { data: pastRows }] = await Promise.all([
    supabase.from("closed_day").select("closed_date, reason").gte("closed_date", today).order("closed_date"),
    supabase.from("closed_day").select("closed_date, reason").lt("closed_date", today).order("closed_date", { ascending: false }).limit(PAST_SHOWN),
  ]);
  const upcoming = upcomingRows ?? [];

  // Count bookings on the upcoming days (an appointment holds its scheduled
  // time, or its requested time while it is a request).
  const counts = new Map<string, number>();
  if (upcoming.length) {
    const from = `${upcoming[0].closed_date}T00:00:00+08:00`;
    const to = `${addDays(upcoming[upcoming.length - 1].closed_date, 1)}T00:00:00+08:00`;
    const { data: appointments } = await supabase
      .from("appointment")
      .select("requested_datetime, scheduled_datetime")
      .neq("status", "CANCELLED")
      .or(
        `and(scheduled_datetime.gte.${from},scheduled_datetime.lt.${to}),and(scheduled_datetime.is.null,requested_datetime.gte.${from},requested_datetime.lt.${to})`,
      );
    for (const row of appointments ?? []) {
      const day = manilaDate(row.scheduled_datetime ?? row.requested_datetime);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  return {
    upcoming: upcoming.map((row) => ({ date: row.closed_date, reason: row.reason, booked: counts.get(row.closed_date) ?? 0 })),
    past: (pastRows ?? []).map((row) => ({ date: row.closed_date, reason: row.reason, booked: 0 })),
  };
}
