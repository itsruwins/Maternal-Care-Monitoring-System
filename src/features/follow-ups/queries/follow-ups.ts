import "server-only";
import { manilaSlot } from "@/lib/appointments/slots";
import { createClient } from "@/lib/supabase/server";
import { addDays, daysBetween } from "@/lib/utils/pregnancy";
import type { FollowUpItemRow } from "@/types/database";
import type { FollowUpEntry, FollowUpFilters, FollowUpItem } from "../types";

export const FOLLOW_UPS_PAGE_SIZE = 20;

type Client = Awaited<ReturnType<typeof createClient>>;

const ITEM_FIELDS =
  "appointment_id, activity_type_id, service, missed_at, mother_id, first_name, middle_name, last_name, contact_number, purok_name, is_open, ended_how, ended_at, close_reason, rebooked_at";
type ItemRow = Pick<
  FollowUpItemRow,
  | "appointment_id"
  | "activity_type_id"
  | "service"
  | "missed_at"
  | "mother_id"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "contact_number"
  | "purok_name"
  | "is_open"
  | "ended_how"
  | "ended_at"
  | "close_reason"
  | "rebooked_at"
>;

const dayStart = (date: string) => `${date}T00:00:00+08:00`;

/** Reads ?tab=&q=&purok=&from=&to=&tried=&page= into safe values. */
export function parseFollowUpFilters(params: Record<string, string | string[] | undefined>): FollowUpFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const date = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
  const purok = one("purok");
  const tried = one("tried");
  const page = Number.parseInt(one("page"), 10);
  return {
    tab: one("tab") === "closed" ? "closed" : "open",
    // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    purok: purok === "none" ? "none" : /^[1-9]\d{0,9}$/.test(purok) ? Number(purok) : "",
    from: date(one("from")),
    to: date(one("to")),
    tried: tried === "no" || tried === "yes" ? tried : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// All read as the logged-in staff member (follow-ups are staff-only, 0015).

/**
 * Missed visits on one tab, 20 per page: open ones oldest first, closed ones
 * most recently sorted out first. Search: every word must match a name part
 * or the mobile number.
 */
export async function listFollowUps(
  filters: FollowUpFilters,
  viewer: { isAdmin: boolean },
  today: string,
): Promise<{ items: FollowUpItem[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * FOLLOW_UPS_PAGE_SIZE;
  let query = supabase
    .from("follow_up_item")
    .select(ITEM_FIELDS, { count: "exact" })
    .eq("is_open", filters.tab === "open")
    .range(from, from + FOLLOW_UPS_PAGE_SIZE - 1);
  query =
    filters.tab === "open"
      ? query.order("missed_at").order("appointment_id")
      : query.order("ended_at", { ascending: false, nullsFirst: false }).order("appointment_id", { ascending: false });

  for (const word of filters.q.split(" ").filter(Boolean)) {
    const like = `%${word}%`;
    query = query.or(`first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},contact_number.ilike.${like}`);
  }
  if (filters.purok === "none") query = query.is("purok_id", null);
  else if (filters.purok) query = query.eq("purok_id", filters.purok);
  if (filters.from) query = query.gte("missed_at", dayStart(filters.from));
  if (filters.to) query = query.lt("missed_at", dayStart(addDays(filters.to, 1)!));
  if (filters.tried === "no") query = query.eq("attempts", 0);
  else if (filters.tried === "yes") query = query.gt("attempts", 0);

  const { data, count, error } = await query;
  if (error || !data) return { items: [], total: 0 };
  return { items: await withEntries(supabase, data, viewer, today), total: count ?? 0 };
}

/** How many missed visits still need a follow-up: all (the Open tab's count) or one mother's. */
export async function countOpenFollowUps(motherId?: number): Promise<number> {
  const supabase = await createClient();
  let query = supabase.from("follow_up_item").select("appointment_id", { count: "exact", head: true }).eq("is_open", true);
  if (motherId) query = query.eq("mother_id", motherId);
  const { count } = await query;
  return count ?? 0;
}

/** One mother's missed visits, newest first (her record splits open and closed). */
export async function listMotherFollowUps(motherId: number, viewer: { isAdmin: boolean }, today: string): Promise<FollowUpItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follow_up_item")
    .select(ITEM_FIELDS)
    .eq("mother_id", motherId)
    .order("missed_at", { ascending: false })
    .order("appointment_id", { ascending: false });
  return withEntries(supabase, data ?? [], viewer, today);
}

/** One missed visit with its follow-ups (e.g. for rebooking), or null. */
export async function getFollowUpItem(appointmentId: number, viewer: { isAdmin: boolean }, today: string): Promise<FollowUpItem | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("follow_up_item").select(ITEM_FIELDS).eq("appointment_id", appointmentId).maybeSingle();
  if (!data) return null;
  const [item] = await withEntries(supabase, [data], viewer, today);
  return item;
}

async function withEntries(supabase: Client, rows: ItemRow[], viewer: { isAdmin: boolean }, today: string): Promise<FollowUpItem[]> {
  const ids = rows.map((row) => row.appointment_id);
  const { data: logged } = ids.length
    ? await supabase
        .from("follow_up")
        .select("follow_up_id, appointment_id, follow_up_date, method, result, outcome_notes, close_reason, created_at, health_worker:health_worker_id(first_name, last_name)")
        .in("appointment_id", ids)
        .order("follow_up_date", { ascending: false })
        .order("follow_up_id", { ascending: false })
    : { data: [] };

  const entries = new Map<number, FollowUpEntry[]>();
  for (const row of logged ?? []) {
    const list = entries.get(row.appointment_id) ?? [];
    list.push({
      id: row.follow_up_id,
      date: row.follow_up_date,
      method: row.method,
      result: row.result,
      notes: row.outcome_notes,
      closeReason: row.close_reason,
      loggedBy: row.health_worker ? `${row.health_worker.first_name} ${row.health_worker.last_name}` : "",
      canEdit: viewer.isAdmin || manilaSlot(row.created_at).date === today,
    });
    entries.set(row.appointment_id, list);
  }

  return rows.map((row) => {
    const missedDate = manilaSlot(row.missed_at).date;
    return {
      appointmentId: row.appointment_id,
      serviceId: row.activity_type_id,
      service: row.service,
      missedAt: row.missed_at,
      missedDate,
      daysAgo: Math.max(0, daysBetween(missedDate, today) ?? 0),
      mother: {
        id: row.mother_id,
        name: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" "),
        contactNumber: row.contact_number,
        purok: row.purok_name,
      },
      isOpen: row.is_open,
      ending: row.ended_how ? { how: row.ended_how, at: row.ended_at, closeReason: row.close_reason, rebookedAt: row.rebooked_at } : null,
      entries: entries.get(row.appointment_id) ?? [],
    };
  });
}
