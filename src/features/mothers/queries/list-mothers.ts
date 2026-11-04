import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDays, DUE_SOON_DAYS } from "@/lib/utils/pregnancy";
import { MOTHERS_PAGE_SIZE } from "../constants";
import { summarizePregnancies } from "../pregnancy-summary";
import type { MotherFilters, MotherListItem, MotherSort, MotherStatusFilter, MotherTabCounts } from "../types";

const STATUSES: MotherStatusFilter[] = ["pregnant", "dueSoon", "notPregnant"];
const SORTS: MotherSort[] = ["name", "-name", "due", "-due"];
const PAGE = 1000; // Supabase returns at most 1,000 rows per request.

/** Reads ?q=&purok=&due=&status=&sort=&page= into safe filter values. */
export function parseMotherFilters(params: Record<string, string | string[] | undefined>): MotherFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const purok = one("purok");
  const due = one("due");
  const status = one("status") as MotherStatusFilter;
  const sort = one("sort") as MotherSort;
  const page = Number.parseInt(one("page"), 10);
  return {
    // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    purok: purok === "none" ? "none" : /^[1-9]\d{0,9}$/.test(purok) ? Number(purok) : "",
    due: /^\d{4}-(0[1-9]|1[0-2])$/.test(due) ? due : "",
    // The old ?due=soon (still in saved links) is now the "Due within 30 days" tab.
    status: due === "soon" ? "dueSoon" : STATUSES.includes(status) ? status : "",
    sort: SORTS.includes(sort) ? sort : "name",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

type Row = {
  id: number;
  lastName: string;
  firstName: string;
  item: MotherListItem;
};

// The registry, 20 per page. Search: every word must match a name part or
// the mobile number. Every mother matching the search and purok is read (one
// barangay's mothers, 1,000 per request), so the tabs can be counted and the
// list sorted by due date; then the tab and due month narrow it and the
// page is cut. Runs as the logged-in staff member (RLS: staff read every mother).
export async function listMothers(
  filters: MotherFilters,
  today: string,
): Promise<{ items: MotherListItem[]; total: number; counts: MotherTabCounts }> {
  const supabase = await createClient();
  const pregnancyFields = "pregnancy_status, lmp_date, expected_delivery_date, outcome, outcome_date, registration_date";
  const rows: Row[] = [];
  for (let start = 0; ; start += PAGE) {
    let query = supabase
      .from("mother")
      .select(`mother_id, user_id, first_name, middle_name, last_name, contact_number, purok:purok_id(name), pregnancy(${pregnancyFields})`)
      .order("mother_id")
      .range(start, start + PAGE - 1);
    for (const word of filters.q.split(" ").filter(Boolean)) {
      const like = `%${word}%`;
      query = query.or(`first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},contact_number.ilike.${like}`);
    }
    if (filters.purok === "none") query = query.is("purok_id", null);
    else if (filters.purok) query = query.eq("purok_id", filters.purok);
    const { data, error } = await query;
    if (error || !data) return { items: [], total: 0, counts: { all: 0, pregnant: 0, dueSoon: 0, notPregnant: 0 } };
    for (const row of data) {
      rows.push({
        id: row.mother_id,
        lastName: row.last_name,
        firstName: row.first_name,
        item: {
          id: row.mother_id,
          name: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" "),
          contactNumber: row.contact_number,
          purok: row.purok?.name ?? null,
          hasLogin: row.user_id !== null,
          pregnancy: summarizePregnancies(row.pregnancy, today),
        },
      });
    }
    if (data.length < PAGE) break;
  }

  // Due within 30 days = due on or before today + 30, past due included (the dashboard's count).
  const soonEnd = addDays(today, DUE_SOON_DAYS)!;
  const dueOf = (row: Row) => (row.item.pregnancy.kind === "active" ? row.item.pregnancy.dueDate : null);
  const pregnant = (row: Row) => row.item.pregnancy.kind === "active";
  const dueSoon = (row: Row) => {
    const due = dueOf(row);
    return due !== null && due <= soonEnd;
  };
  const counts: MotherTabCounts = {
    all: rows.length,
    pregnant: rows.filter(pregnant).length,
    dueSoon: rows.filter(dueSoon).length,
    notPregnant: rows.filter((row) => !pregnant(row)).length,
  };

  const shown = rows.filter((row) => {
    if (filters.status === "pregnant" && !pregnant(row)) return false;
    if (filters.status === "dueSoon" && !dueSoon(row)) return false;
    if (filters.status === "notPregnant" && pregnant(row)) return false;
    if (filters.due && !dueOf(row)?.startsWith(filters.due)) return false;
    return true;
  });

  // By last name, then first name; by due date with the rest (no due date) after, by name.
  const byName = (a: Row, b: Row) =>
    a.lastName.localeCompare(b.lastName, "en", { sensitivity: "base" }) ||
    a.firstName.localeCompare(b.firstName, "en", { sensitivity: "base" }) ||
    a.id - b.id;
  const direction = filters.sort.startsWith("-") ? -1 : 1;
  shown.sort((a, b) => {
    if (filters.sort === "name" || filters.sort === "-name") return direction * byName(a, b);
    const dueA = dueOf(a);
    const dueB = dueOf(b);
    if (dueA && dueB && dueA !== dueB) return direction * dueA.localeCompare(dueB);
    if (dueA && !dueB) return -1;
    if (!dueA && dueB) return 1;
    return byName(a, b);
  });

  const from = (filters.page - 1) * MOTHERS_PAGE_SIZE;
  return { items: shown.slice(from, from + MOTHERS_PAGE_SIZE).map((row) => row.item), total: shown.length, counts };
}

/** The due-month choices: "YYYY-MM" from `back` months ago to `ahead` months ahead of `today`. */
export function dueMonthOptions(today: string, back: number, ahead: number): string[] {
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: back + ahead + 1 }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 - back + i, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}
