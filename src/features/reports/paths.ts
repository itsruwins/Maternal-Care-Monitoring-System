import type { ReportFilters } from "./types";

export const REPORTS_PATH = "/staff/reports";

/** The reports address for these filters (defaults left out). */
export function reportsHref(filters: ReportFilters, changes: Partial<ReportFilters> = {}): string {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.tab !== "summary") params.set("tab", next.tab);
  if (next.period !== "this-month") params.set("period", next.period);
  if (next.period === "custom") {
    params.set("from", next.from);
    params.set("to", next.to);
  }
  if (next.purok !== "") params.set("purok", String(next.purok));
  if (next.service !== "") params.set("service", String(next.service));
  const query = params.toString();
  return query ? `${REPORTS_PATH}?${query}` : REPORTS_PATH;
}
