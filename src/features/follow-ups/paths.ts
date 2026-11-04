import type { FollowUpFilters } from "./types";

export const NO_FOLLOW_UP_FILTERS: FollowUpFilters = { tab: "open", q: "", purok: "", from: "", to: "", tried: "", page: 1 };

// Addresses inside the follow-ups area (plain functions: usable on the server
// and in the browser).

/** The list with these filters; back to page 1 unless a page is given. */
export function followUpsHref(filters: FollowUpFilters, changes: Partial<FollowUpFilters> = {}): string {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.tab === "closed") params.set("tab", "closed");
  if (next.q) params.set("q", next.q);
  if (next.purok) params.set("purok", String(next.purok));
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.tried) params.set("tried", next.tried);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `?${query}` : "?";
}

/** Where rebooking was started: the Follow-ups page or her record (it goes back there). */
export type RebookFrom = "list" | "record";

export const rebookHref = (appointmentId: number, from: RebookFrom = "list") =>
  `/staff/follow-ups/${appointmentId}/rebook${from === "record" ? "?from=record" : ""}`;

/** Her record, on the Follow-ups tab. */
export const recordFollowUpsHref = (motherId: number) => `/staff/mothers/${motherId}?tab=followUps`;
