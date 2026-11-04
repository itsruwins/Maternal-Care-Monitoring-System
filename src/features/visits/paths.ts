import type { TodayAppointment, VisitCounts, VisitFilters } from "./types";

// Addresses and small rules for the Visits page (plain functions: usable on
// the server and in the browser).

export const NO_VISIT_FILTERS: VisitFilters = { q: "", from: "", to: "", page: 1 };

/** The visits list with these filters; back to page 1 unless a page is given. Defaults stay out of the address. */
export function visitsHref(filters: VisitFilters, changes: Partial<VisitFilters> = {}): string {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.page > 1) params.set("page", String(next.page));
  return `?${params.toString()}#recent`;
}

export const visitHref = (visitId: number) => `/staff/visits/${visitId}`;
export const recordVisitHref = (appointmentId: number) => `/staff/visits/new?appointment=${appointmentId}`;
export const motherVisitsHref = (motherId: number) => `/staff/mothers/${motherId}?tab=visits`;

/** High blood pressure: 140 over 90 or more (either number). */
export const bpHigh = (systolic: number, diastolic: number) => systolic >= 140 || diastolic >= 90;

/** Booked today, and those still waiting for a visit (every one showing Record visit, a missed one too: she may come late). */
export function countToday(todays: TodayAppointment[]): Pick<VisitCounts, "booked" | "toRecord"> {
  return { booked: todays.length, toRecord: todays.filter((item) => item.status !== "COMPLETED" && item.visitId === null && item.dayVisitId === null).length };
}
