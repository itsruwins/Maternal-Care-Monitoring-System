import "server-only";
import { toServiceIcon } from "@/lib/appointments/service-icons";
import { addMonths, manilaSlot, slotKey } from "@/lib/appointments/slots";
import { createClient } from "@/lib/supabase/server";
import { addDays, gestationalAge, PREGNANCY_DAYS } from "@/lib/utils/pregnancy";
import type { AppointmentStatus } from "@/types/database";
import type { AppointmentFilters, BookableMother, Service, SlotData, StaffAppointment } from "../types";
import { APPOINTMENT_SELECT, manilaDayStart, slotInRange, toAppointments } from "./shared";

export const APPOINTMENTS_PAGE_SIZE = 20;
const STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];
const bySlot = (a: StaffAppointment, b: StaffAppointment) => a.at.localeCompare(b.at);

// All read as the logged-in staff member (RLS: staff see every appointment).

/** Requests waiting for review, oldest request first. */
export async function listRequests(): Promise<StaffAppointment[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("appointment").select(APPOINTMENT_SELECT).eq("status", "REQUESTED").order("created_at");
  return toAppointments(supabase, data ?? []);
}

export async function countRequests(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("appointment").select("appointment_id", { count: "exact", head: true }).eq("status", "REQUESTED");
  return count ?? 0;
}

/** Reads ?status=&service=&from=&to=&page= into safe values. */
export function parseAppointmentFilters(params: Record<string, string | string[] | undefined>): AppointmentFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const date = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
  const page = Number.parseInt(one("page"), 10);
  return {
    status: STATUSES.includes(one("status") as AppointmentStatus) ? (one("status") as AppointmentStatus) : "",
    service: /^[1-9]\d{0,9}$/.test(one("service")) ? Number(one("service")) : "",
    from: date(one("from")),
    to: date(one("to")),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/**
 * Appointments by date, 20 per page. Pages follow the requested time (a
 * rescheduled visit can sit a little out of place across pages; each page is
 * sorted by its actual slot).
 */
export async function listAppointments(filters: AppointmentFilters): Promise<{ items: StaffAppointment[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * APPOINTMENTS_PAGE_SIZE;
  let query = supabase
    .from("appointment")
    .select(APPOINTMENT_SELECT, { count: "exact" })
    .order("requested_datetime", { ascending: true })
    .range(from, from + APPOINTMENTS_PAGE_SIZE - 1);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.service) query = query.eq("activity_type_id", filters.service);
  if (filters.from || filters.to) {
    query = query.or(slotInRange(manilaDayStart(filters.from || "2000-01-01"), manilaDayStart(addDays(filters.to || "2100-01-01", 1)!)));
  }
  const { data, count } = await query;
  return { items: (await toAppointments(supabase, data ?? [])).sort(bySlot), total: count ?? 0 };
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
