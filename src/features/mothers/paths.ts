import type { MotherFilters } from "./types";

// Addresses inside the mother registry (plain functions: usable on the server
// and in the browser).

/** The list with these filters; back to page 1 unless a page is given. Defaults stay out of the address. */
export function mothersHref(filters: MotherFilters, changes: Partial<MotherFilters> = {}): string {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.status) params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.purok) params.set("purok", String(next.purok));
  if (next.due) params.set("due", next.due);
  if (next.sort !== "name") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `?${query}` : "?";
}

/** A due month only narrows current pregnancies, so the Due-within-30-days and Not-pregnant tabs drop it. */
export const tabKeepsDueMonth = (status: MotherFilters["status"]) => status === "" || status === "pregnant";

export const motherRecordHref = (motherId: number) => `/staff/mothers/${motherId}`;
export const bookForMotherHref = (motherId: number) => `/staff/appointments/new?mother=${motherId}`;
export const recordVisitForMotherHref = (motherId: number) => `/staff/visits/new?mother=${motherId}`;
