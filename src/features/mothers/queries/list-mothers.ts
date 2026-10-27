import "server-only";
import { createClient } from "@/lib/supabase/server";
import { MOTHERS_PAGE_SIZE } from "../constants";
import { summarizePregnancies } from "../pregnancy-summary";
import type { MotherFilters, MotherListItem, MotherStatusFilter } from "../types";

const STATUSES: MotherStatusFilter[] = ["pregnant", "notPregnant"];

/** Reads ?q=&purok=&due=&status=&page= into safe filter values. */
export function parseMotherFilters(params: Record<string, string | string[] | undefined>): MotherFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const purok = one("purok");
  const status = one("status") as MotherStatusFilter;
  const page = Number.parseInt(one("page"), 10);
  return {
    // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    purok: purok === "none" ? "none" : /^[1-9]\d{0,9}$/.test(purok) ? Number(purok) : "",
    due: /^\d{4}-(0[1-9]|1[0-2])$/.test(one("due")) ? one("due") : "",
    status: STATUSES.includes(status) ? status : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** First day of the month after "YYYY-MM". */
function nextMonthStart(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

// Mothers by last name, 20 per page. Search: every word must match a name
// part or the mobile number. A due month only finds current pregnancies.
// Runs as the logged-in staff member (RLS: staff can read every mother).
export async function listMothers(
  filters: MotherFilters,
  today: string,
): Promise<{ items: MotherListItem[]; total: number }> {
  const supabase = await createClient();
  const onlyPregnant = filters.status === "pregnant" || Boolean(filters.due);

  // "Not pregnant now": leave out mothers who have an active pregnancy.
  let pregnantIds: number[] = [];
  if (filters.status === "notPregnant" && !filters.due) {
    const { data } = await supabase.from("pregnancy").select("mother_id").eq("pregnancy_status", "ACTIVE");
    pregnantIds = (data ?? []).map((row) => row.mother_id);
  }

  const pregnancyFields = "pregnancy_status, lmp_date, expected_delivery_date, outcome, outcome_date, registration_date";
  const from = (filters.page - 1) * MOTHERS_PAGE_SIZE;
  let query = supabase
    .from("mother")
    .select(
      `mother_id, user_id, first_name, middle_name, last_name, contact_number, purok:purok_id(name), ${
        onlyPregnant ? `pregnancy!inner(${pregnancyFields})` : `pregnancy(${pregnancyFields})`
      }`,
      { count: "exact" },
    )
    .order("last_name")
    .order("first_name")
    .order("mother_id")
    .range(from, from + MOTHERS_PAGE_SIZE - 1);

  for (const word of filters.q.split(" ").filter(Boolean)) {
    const like = `%${word}%`;
    query = query.or(`first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},contact_number.ilike.${like}`);
  }
  if (filters.purok === "none") query = query.is("purok_id", null);
  else if (filters.purok) query = query.eq("purok_id", filters.purok);
  if (onlyPregnant) query = query.eq("pregnancy.pregnancy_status", "ACTIVE");
  if (filters.due) {
    query = query
      .gte("pregnancy.expected_delivery_date", `${filters.due}-01`)
      .lt("pregnancy.expected_delivery_date", nextMonthStart(filters.due));
  }
  if (pregnantIds.length) query = query.not("mother_id", "in", `(${pregnantIds.join(",")})`);

  const { data, count, error } = await query;
  if (error || !data) return { items: [], total: 0 };

  return {
    total: count ?? 0,
    items: data.map((row) => ({
      id: row.mother_id,
      name: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" "),
      contactNumber: row.contact_number,
      purok: row.purok?.name ?? null,
      hasLogin: row.user_id !== null,
      pregnancy: summarizePregnancies(row.pregnancy, today),
    })),
  };
}

/** The due-month choices: "YYYY-MM" from `back` months ago to `ahead` months ahead of `today`. */
export function dueMonthOptions(today: string, back: number, ahead: number): string[] {
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: back + ahead + 1 }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 - back + i, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}
