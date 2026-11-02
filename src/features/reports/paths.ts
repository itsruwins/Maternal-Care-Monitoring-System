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
  if (next.show !== "") params.set("show", next.show);
  if (next.status !== "") params.set("status", next.status);
  if (next.type !== "") params.set("type", next.type);
  const query = params.toString();
  return query ? `${REPORTS_PATH}?${query}` : REPORTS_PATH;
}

/** Her record, on the tab a report row is about. */
export const motherRecordHref = (motherId: number, tab: "pregnancy" | "visits" | "appointments" | "sms") => `/staff/mothers/${motherId}?tab=${tab}`;

/** One visit's page. */
export const visitHref = (visitId: number) => `/staff/visits/${visitId}`;

export const REPORT_CSV_PATH = "/api/reports/csv";

/** The CSV download for these filters, in the page's language. */
export function reportCsvHref(filters: ReportFilters, locale: string): string {
  const query = reportsHref(filters).split("?")[1];
  return `${REPORT_CSV_PATH}?${query ? `${query}&` : ""}lang=${locale}`;
}
