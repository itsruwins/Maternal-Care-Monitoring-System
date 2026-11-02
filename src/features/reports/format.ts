import type { Locale } from "@/i18n/config";
import { parseISODate } from "@/lib/utils/pregnancy";

const intlLocale = (locale: Locale) => (locale === "fil" ? "fil-PH" : "en-PH");
const day = (iso: string) => parseISODate(iso) ?? new Date(0);

/** "Nov 1 – 30, 2026", "Oct 15 – Nov 4, 2026" or "Dec 1, 2025 – Jan 31, 2026". */
export function formatPeriod(from: string, to: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
  return from === to ? formatter.format(day(from)) : formatter.formatRange(day(from), day(to));
}

/** A chart column's short label: "Nov 2" for a week (its first day), "Jan" for a month. */
export function bucketLabel(start: string, grouping: "week" | "month", locale: Locale): string {
  const options: Intl.DateTimeFormatOptions =
    grouping === "week" ? { timeZone: "UTC", month: "short", day: "numeric" } : { timeZone: "UTC", month: "short" };
  return new Intl.DateTimeFormat(intlLocale(locale), options).format(day(start));
}

/** A chart column in full: "Nov 2 – 8" for a week, "January 2026" for a month. */
export function bucketName(start: string, end: string, grouping: "week" | "month", locale: Locale): string {
  if (grouping === "month") {
    return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", month: "long", year: "numeric" }).format(day(start));
  }
  const formatter = new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", month: "short", day: "numeric" });
  return start === end ? formatter.format(day(start)) : formatter.formatRange(day(start), day(end));
}

/** A record's day, with the year (a report can span two): "Nov 5, 2026", never broken. `iso` is a date or an instant (shown in Manila time). */
export function formatReportDay(iso: string, locale: Locale): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const text = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Intl.DateTimeFormat(intlLocale(locale), { ...options, timeZone: "UTC" }).format(day(iso))
    : new Intl.DateTimeFormat(intlLocale(locale), { ...options, timeZone: "Asia/Manila" }).format(new Date(iso));
  return text.replace(/ /g, "\u00a0");
}

/** "9:00 AM" in Manila time, never broken before AM/PM. */
export function formatReportClock(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" })
    .format(new Date(iso))
    .replace(/\s+(?=[AP]M\b)/gi, " ");
}
