import "server-only";
import { toServiceIcon } from "@/lib/appointments/service-icons";
import { addMonths, manilaSlot, slotKey } from "@/lib/appointments/slots";
import { createClient } from "@/lib/supabase/server";
import { addDays, gestationalAge, PREGNANCY_DAYS, weekOf } from "@/lib/utils/pregnancy";
import { LIST_TABS } from "../paths";
import type { AppointmentFilters, BookableMother, HubCounts, ListTab, ListTabCounts, Service, SlotData, StaffAppointment } from "../types";
import { APPOINTMENT_SELECT, manilaDayStart, slotInRange, toAppointments } from "./shared";

export const APPOINTMENTS_PAGE_SIZE = 20;
const bySlot = (a: StaffAppointment, b: StaffAppointment) => a.at.localeCompare(b.at);

// All read as the logged-in staff member (RLS: staff see every appointment).

/** Requests waiting for review, oldest request first. */
export async function listRequests(): Promise<StaffAppointment[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("appointment").select(APPOINTMENT_SELECT).eq("status", "REQUESTED").order("created_at");
  return toAppointments(supabase, data ?? []);
}

/** Reads ?status=&q=&service=&from=&to=&page= into safe values (old ?status=CONFIRMED / RESCHEDULED links open Upcoming). */
export function parseAppointmentFilters(params: Record<string, string | string[] | undefined>): AppointmentFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const date = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
  const page = Number.parseInt(one("page"), 10);
  const status = one("status");
  return {
    status: status === "CONFIRMED" || status === "RESCHEDULED" ? "upcoming" : LIST_TABS.includes(status as ListTab) ? (status as ListTab) : "",
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    service: /^[1-9]\d{0,9}$/.test(one("service")) ? Number(one("service")) : "",
    from: date(one("from")),
    to: date(one("to")),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** The builder methods the List's filters use (every select's builder has them). */
type Filterable = {
  eq(column: string, value: unknown): Filterable;
  neq(column: string, value: unknown): Filterable;
  in(column: string, values: readonly unknown[]): Filterable;
  or(filters: string): Filterable;
};

/** Her pregnancies when searching by her name or number (every word must match); null without a search. */
async function searchedPregnancies(supabase: Awaited<ReturnType<typeof createClient>>, q: string): Promise<number[] | null> {
  if (!q) return null;
  let query = supabase.from("mother").select("mother_id, pregnancy(pregnancy_id)").limit(200);
  for (const word of q.split(" ").filter(Boolean)) {
    const like = `%${word}%`;
    query = query.or(`first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},contact_number.ilike.${like}`);
  }
  const { data } = await query;
  return (data ?? []).flatMap((mother) => mother.pregnancy.map((p) => p.pregnancy_id));
}

/**
 * One List tab, 20 per page, with every tab's count (search, service and
 * dates applied). Upcoming and Requested run soonest first, as does any tab
 * with dates chosen; the others newest first. Pages follow the requested time
 * (a moved visit can sit a little out of place across pages; each page is
 * sorted by its actual slot). `today` is a Manila date.
 */
export async function listAppointments(
  filters: AppointmentFilters,
  today: string,
): Promise<{ items: StaffAppointment[]; total: number; counts: ListTabCounts }> {
  const supabase = await createClient();
  const pregnancies = await searchedPregnancies(supabase, filters.q);
  const none = { items: [], total: 0, counts: { all: 0, upcoming: 0, REQUESTED: 0, MISSED: 0, COMPLETED: 0, CANCELLED: 0 } };
  if (pregnancies && !pregnancies.length) return none;

  const scope = <Q,>(query: Q, tab: ListTab): Q => {
    let q = query as unknown as Filterable;
    if (tab === "") q = q.neq("status", "CANCELLED");
    else if (tab === "upcoming") q = q.in("status", ["CONFIRMED", "RESCHEDULED"]);
    else q = q.eq("status", tab);
    if (filters.service) q = q.eq("activity_type_id", filters.service);
    if (pregnancies) q = q.in("pregnancy_id", pregnancies);
    // Upcoming starts today at the earliest.
    const from = tab === "upcoming" && (!filters.from || filters.from < today) ? today : filters.from;
    if (from || filters.to) {
      q = q.or(slotInRange(manilaDayStart(from || "2000-01-01"), manilaDayStart(addDays(filters.to || "2100-01-01", 1)!)));
    }
    return q as unknown as Q;
  };
  const count = async (tab: ListTab) => {
    const { count } = await scope(supabase.from("appointment").select("appointment_id", { count: "exact", head: true }), tab);
    return count ?? 0;
  };

  const ascending = filters.status === "upcoming" || filters.status === "REQUESTED" || Boolean(filters.from || filters.to);
  const start = (filters.page - 1) * APPOINTMENTS_PAGE_SIZE;
  const [{ data, count: total }, all, upcoming, requested, missed, completed, cancelled] = await Promise.all([
    scope(supabase.from("appointment").select(APPOINTMENT_SELECT, { count: "exact" }), filters.status)
      .order("requested_datetime", { ascending })
      .range(start, start + APPOINTMENTS_PAGE_SIZE - 1),
    count(""),
    count("upcoming"),
    count("REQUESTED"),
    count("MISSED"),
    count("COMPLETED"),
    count("CANCELLED"),
  ]);
  const items = (await toAppointments(supabase, data ?? [])).sort((a, b) => (ascending ? bySlot(a, b) : bySlot(b, a)));
  return {
    items,
    total: total ?? 0,
    counts: { all, upcoming, REQUESTED: requested, MISSED: missed, COMPLETED: completed, CANCELLED: cancelled },
  };
}

/** The counts above the views: waiting requests, today, this week (Sunday to Saturday), missed visits to follow up. */
export async function getHubCounts(today: string): Promise<HubCounts> {
  const supabase = await createClient();
  const week = weekOf(today);
  const booked = (first: string, last: string) =>
    supabase
      .from("appointment")
      .select("appointment_id", { count: "exact", head: true })
      .neq("status", "CANCELLED")
      .or(slotInRange(manilaDayStart(first), manilaDayStart(addDays(last, 1)!)));
  const [requests, todays, thisWeek, missed] = await Promise.all([
    supabase.from("appointment").select("appointment_id", { count: "exact", head: true }).eq("status", "REQUESTED"),
    booked(today, today),
    booked(week[0], week[6]),
    supabase.from("follow_up_item").select("appointment_id", { count: "exact", head: true }).eq("is_open", true),
  ]);
  return { requests: requests.count ?? 0, today: todays.count ?? 0, week: thisWeek.count ?? 0, missed: missed.count ?? 0 };
}

/** Everything not cancelled in a month ("YYYY-MM"), grouped by Manila date. */
export async function listMonth(month: string): Promise<{ byDay: Record<string, StaffAppointment[]>; closedDays: string[] }> {
  const supabase = await createClient();
  const first = `${month}-01`;
  const next = addMonths(first, 1);
  const [{ data }, { data: closed }] = await Promise.all([
    supabase.from("appointment").select(APPOINTMENT_SELECT).neq("status", "CANCELLED").or(slotInRange(manilaDayStart(first), manilaDayStart(next))),
    supabase.from("closed_day").select("closed_date").gte("closed_date", first).lt("closed_date", next),
  ]);
  const byDay: Record<string, StaffAppointment[]> = {};
  for (const item of (await toAppointments(supabase, data ?? [])).sort(bySlot)) {
    (byDay[manilaSlot(item.at).date] ??= []).push(item);
  }
  return { byDay, closedDays: (closed ?? []).map((row) => row.closed_date) };
}

/** One mother's appointments (record tab), newest slot last. */
export async function listMotherAppointments(motherId: number): Promise<StaffAppointment[]> {
  const supabase = await createClient();
  const { data: pregnancies } = await supabase.from("pregnancy").select("pregnancy_id").eq("mother_id", motherId);
  const ids = (pregnancies ?? []).map((p) => p.pregnancy_id);
  if (!ids.length) return [];
  const { data } = await supabase.from("appointment").select(APPOINTMENT_SELECT).in("pregnancy_id", ids);
  return (await toAppointments(supabase, data ?? [])).sort(bySlot);
}

export async function listServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("activity_type").select("activity_type_id, name, icon").order("activity_type_id");
  return (data ?? []).map((row) => ({ id: row.activity_type_id, name: row.name, icon: toServiceIcon(row.icon) }));
}

/** Closed days and taken times from today up to 6 months ahead (staff can book today). */
export async function getStaffSlotData(today: string): Promise<SlotData> {
  const last = addMonths(today, 6);
  const supabase = await createClient();
  const [{ data: closed }, { data: taken }] = await Promise.all([
    supabase.from("closed_day").select("closed_date").gte("closed_date", today).lte("closed_date", last),
    supabase.rpc("taken_slots", { p_from: today, p_to: addMonths(today, 4) }),
  ]);
  // taken_slots covers about 4 months per call; fetch the rest separately.
  const { data: later } = await supabase.rpc("taken_slots", { p_from: addDays(addMonths(today, 4), 1)!, p_to: last });
  return {
    first: today,
    last,
    closedDays: (closed ?? []).map((row) => row.closed_date),
    taken: [...(taken ?? []), ...(later ?? [])].map((iso) => {
      const slot = manilaSlot(iso);
      return slotKey(slot.date, slot.time);
    }),
  };
}

/** Mothers with a current pregnancy, matching a search (or one by id). */
export async function findBookableMothers(search: { q?: string; id?: number }, today: string): Promise<BookableMother[]> {
  const supabase = await createClient();
  let query = supabase
    .from("mother")
    .select("mother_id, first_name, middle_name, last_name, contact_number, pregnancy!inner(pregnancy_id, pregnancy_status, lmp_date, expected_delivery_date)")
    .eq("pregnancy.pregnancy_status", "ACTIVE")
    .order("last_name")
    .order("first_name")
    .limit(10);
  if (search.id) query = query.eq("mother_id", search.id);
  // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
  const q = (search.q ?? "").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60);
  for (const word of q.split(" ").filter(Boolean)) {
    const like = `%${word}%`;
    query = query.or(`first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},contact_number.ilike.${like}`);
  }
  const { data } = await query;
  return (data ?? []).map((row) => {
    const pregnancy = row.pregnancy[0];
    const lmp = pregnancy.lmp_date ?? (pregnancy.expected_delivery_date ? addDays(pregnancy.expected_delivery_date, -PREGNANCY_DAYS) : null);
    return {
      id: row.mother_id,
      pregnancyId: pregnancy.pregnancy_id,
      name: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" "),
      contactNumber: row.contact_number,
      weeks: lmp ? (gestationalAge(lmp, today)?.weeks ?? null) : null,
    };
  });
}
