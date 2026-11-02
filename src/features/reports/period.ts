import { addDays, daysBetween, parseISODate } from "@/lib/utils/pregnancy";
import type { AppointmentStatus } from "@/types/database";
import type { PregnancyShow, ReportFilters, ReportPeriod, ReportTab, SmsStatusFilter, SmsTypeFilter } from "./types";

export const REPORT_TABS: ReportTab[] = ["summary", "pregnancies", "visits", "appointments", "services", "sms"];
export const REPORT_PERIODS: ReportPeriod[] = ["this-month", "last-month", "this-year", "custom"];
/** Tabs that take the service filter. */
export const SERVICE_TABS: ReadonlySet<ReportTab> = new Set(["visits", "appointments", "services"]);
export const PREGNANCY_SHOWS: PregnancyShow[] = ["still", "added", "closed"];
export const APPOINTMENT_STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];
export const SMS_STATUSES: SmsStatusFilter[] = ["waiting", "sent", "delivered", "failed", "skipped"];
export const SMS_TYPES: SmsTypeFilter[] = ["reminder", "missed", "answer"];
/** Up to this many days the visits chart counts by week; longer, by month. */
export const WEEKLY_UP_TO_DAYS = 92;

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && parseISODate(value) !== null;

/** Last day of the month a "YYYY-MM-DD" day falls in. */
export function monthEnd(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

/** The first and last day of a preset period, for a Manila `today`. */
export function presetRange(period: Exclude<ReportPeriod, "custom">, today: string): { from: string; to: string } {
  const monthStart = `${today.slice(0, 7)}-01`;
  if (period === "this-month") return { from: monthStart, to: monthEnd(monthStart) };
  if (period === "last-month") {
    const lastStart = `${addDays(monthStart, -1)!.slice(0, 7)}-01`;
    return { from: lastStart, to: monthEnd(lastStart) };
  }
  return { from: `${today.slice(0, 4)}-01-01`, to: `${today.slice(0, 4)}-12-31` };
}

/**
 * Reads ?tab=&period=&from=&to=&purok=&service= into safe values. A custom
 * period needs both dates (swapped if backwards); anything else falls back
 * to This month. The SMS tab is for admins only.
 */
export function parseReportFilters(
  params: Record<string, string | string[] | undefined>,
  today: string,
  viewer: { isAdmin: boolean },
): ReportFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const tab = one("tab") as ReportTab;
  const period = one("period") as ReportPeriod;
  const purok = one("purok");
  const service = one("service");
  const show = one("show");
  const status = one("status");
  const type = one("type");

  let range: { from: string; to: string };
  let chosen: ReportPeriod = REPORT_PERIODS.includes(period) ? period : "this-month";
  if (chosen === "custom") {
    const from = one("from");
    const to = one("to");
    if (isDate(from) && isDate(to)) range = from <= to ? { from, to } : { from: to, to: from };
    else {
      chosen = "this-month";
      range = presetRange(chosen, today);
    }
  } else range = presetRange(chosen, today);

  const shownTab: ReportTab = REPORT_TABS.includes(tab) && (tab !== "sms" || viewer.isAdmin) ? tab : "summary";
  // Show, status and type belong to one tab each; elsewhere they're dropped.
  const statuses: readonly string[] = shownTab === "appointments" ? APPOINTMENT_STATUSES : shownTab === "sms" ? SMS_STATUSES : [];
  return {
    tab: shownTab,
    period: chosen,
    ...range,
    purok: purok === "none" ? "none" : /^[1-9]\d{0,9}$/.test(purok) ? Number(purok) : "",
    service: SERVICE_TABS.has(shownTab) && /^[1-9]\d{0,9}$/.test(service) ? Number(service) : "",
    show: shownTab === "pregnancies" && PREGNANCY_SHOWS.includes(show as PregnancyShow) ? (show as PregnancyShow) : "",
    status: statuses.includes(status) ? (status as ReportFilters["status"]) : "",
    type: shownTab === "sms" && SMS_TYPES.includes(type as SmsTypeFilter) ? (type as SmsTypeFilter) : "",
  };
}

/** Week buckets (Monday to Sunday, clipped to the period) up to 3 months; month buckets beyond. */
export function visitBuckets(from: string, to: string): { grouping: "week" | "month"; ranges: { start: string; end: string }[] } {
  const days = (daysBetween(from, to) ?? 0) + 1;
  const ranges: { start: string; end: string }[] = [];
  if (days <= WEEKLY_UP_TO_DAYS) {
    let start = from;
    while (start <= to) {
      const weekday = (parseISODate(start)!.getUTCDay() + 6) % 7; // Monday = 0
      const sunday = addDays(start, 6 - weekday)!;
      const end = sunday < to ? sunday : to;
      ranges.push({ start, end });
      start = addDays(end, 1)!;
    }
    return { grouping: "week", ranges };
  }
  let start = from;
  while (start <= to) {
    const last = monthEnd(start);
    const end = last < to ? last : to;
    ranges.push({ start, end });
    start = addDays(end, 1)!;
  }
  return { grouping: "month", ranges };
}
