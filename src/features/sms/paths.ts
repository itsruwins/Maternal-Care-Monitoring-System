import type { SmsLogFilters } from "./types";

// Addresses for the SMS log (plain functions: usable on the server and in the
// browser).

export const SMS_LOG_PATH = "/admin/sms";

/** The SMS log with these filters; back to page 1 unless a page is given. */
export function smsLogHref(filters: SmsLogFilters, changes: Partial<SmsLogFilters> = {}): string {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status) params.set("status", next.status);
  if (next.type) params.set("type", next.type);
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `${SMS_LOG_PATH}?${query}` : SMS_LOG_PATH;
}

export const NO_SMS_FILTERS: SmsLogFilters = { q: "", status: "", type: "", from: "", to: "", page: 1 };

/** Her record, on the SMS log tab. */
export const recordSmsHref = (motherId: number) => `/staff/mothers/${motherId}?tab=sms`;
