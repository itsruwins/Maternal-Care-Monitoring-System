import "server-only";
import { addDays } from "@/lib/utils/pregnancy";
import type { ReportFilters } from "../types";

// Shared helpers for report queries. A report must never be quietly wrong, so
// a failed read throws (the page shows its error state) instead of counting 0.

const PAGE = 1000; // Supabase returns at most 1,000 rows per request.

/** Every row of a query, read 1,000 at a time. `page` must build a fresh, ordered query each call. */
export async function readAll<Row>(page: (from: number, to: number) => PromiseLike<{ data: Row[] | null; error: unknown }>): Promise<Row[]> {
  const rows: Row[] = [];
  for (let start = 0; ; start += PAGE) {
    const { data, error } = await page(start, start + PAGE - 1);
    if (error) throw new Error("Report read failed", { cause: error });
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

/** The count of a head-only count query. */
export async function countOf(query: PromiseLike<{ count: number | null; error: unknown }>): Promise<number> {
  const { count, error } = await query;
  if (error) throw new Error("Report count failed", { cause: error });
  return count ?? 0;
}

type Filterable<T> = { eq(column: string, value: number): T; is(column: string, value: null): T };

/** Narrows a query to the chosen purok ("none" = mothers with no purok yet). `column` is the path to mother.purok_id. */
export function byPurok<T extends Filterable<T>>(query: T, column: string, purok: ReportFilters["purok"]): T {
  if (purok === "none") return query.is(column, null);
  if (purok !== "") return query.eq(column, purok);
  return query;
}

/** The period as UTC instants: from the first day's Manila midnight up to (not including) the day after the last. */
export function periodInstants(filters: Pick<ReportFilters, "from" | "to">) {
  const at = (day: string) => new Date(`${day}T00:00:00+08:00`).toISOString();
  return { startAt: at(filters.from), endAt: at(addDays(filters.to, 1)!) };
}
