import type { AppointmentFilters, ListTab } from "./types";

// Addresses inside the appointments page (plain functions: usable on the
// server and in the browser).

export const LIST_TABS: ListTab[] = ["", "upcoming", "REQUESTED", "MISSED", "COMPLETED", "CANCELLED"];

export const NO_LIST_FILTERS: AppointmentFilters = { status: "", q: "", service: "", from: "", to: "", page: 1 };

/** The List view with these filters; back to page 1 unless a page is given. Defaults stay out of the address. */
export function appointmentsListHref(filters: AppointmentFilters, changes: Partial<AppointmentFilters> = {}): string {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams({ view: "list" });
  if (next.status) params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.service) params.set("service", String(next.service));
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.page > 1) params.set("page", String(next.page));
  return `?${params.toString()}`;
}

/** The calendar on one day. */
export const calendarDayHref = (day: string) => `?view=calendar&month=${day.slice(0, 7)}&day=${day}`;

export const motherAppointmentsHref = (motherId: number) => `/staff/mothers/${motherId}?tab=appointments`;
