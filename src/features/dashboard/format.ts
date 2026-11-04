import type { Locale } from "@/i18n/config";
import { formatMonth } from "@/lib/utils/manila-date";
import { parseISODate } from "@/lib/utils/pregnancy";

const intlLocale = (locale: Locale) => (locale === "fil" ? "fil-PH" : "en-PH");

/** "Monday, November 2, 2026" for a "YYYY-MM-DD" day. */
export function formatLongDay(iso: string, locale: Locale): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** "Nov 9" for a "YYYY-MM-DD" day (the year is the current one, or close to it). */
export function formatShortDay(iso: string, locale: Locale): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", month: "short", day: "numeric" }).format(date);
}

/** "November 2026" for the month a "YYYY-MM-DD" day falls in. */
export const formatMonthOf = (iso: string, locale: Locale) => formatMonth(iso.slice(0, 7), locale);

/** The greeting's part of the day, by the hour in Manila. */
export function dayPartOf(now: Date = new Date()): "morning" | "afternoon" | "evening" {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", hour: "numeric", hourCycle: "h23" }).format(now));
  return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
}

/** "Mon" for a "YYYY-MM-DD" day. */
export function formatWeekday(iso: string, locale: Locale): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", weekday: "short" }).format(date);
}
