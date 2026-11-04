import { keepTimeTogether } from "@/lib/utils/date-time";

// Appointment dates and times for display, in Manila time.

const tag = (locale: string) => (locale === "fil" ? "fil-PH" : "en-PH");

/** "Thursday, November 5" (style "long") or "Thu, Nov 5" (style "short"). */
export function formatSlotDate(iso: string, locale: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: "Asia/Manila",
    weekday: style,
    month: style,
    day: "numeric",
  }).format(new Date(iso));
}

/** "Thursday" (style "long") or "Thu". */
export function formatSlotWeekday(iso: string, locale: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(tag(locale), { timeZone: "Asia/Manila", weekday: style }).format(new Date(iso));
}

/** "Nov 4" (month and day only). */
export function formatMonthDay(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(tag(locale), { timeZone: "Asia/Manila", month: "short", day: "numeric" }).format(new Date(iso));
}

/** "9:00 AM". */
export function formatSlotClock(iso: string, locale: string): string {
  return keepTimeTogether(new Intl.DateTimeFormat(tag(locale), { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" }).format(new Date(iso)));
}

/** "Thursday, November 5 · 9:00 AM". */
export function formatSlot(iso: string, locale: string, style: "long" | "short" = "long"): string {
  return `${formatSlotDate(iso, locale, style)} · ${formatSlotClock(iso, locale)}`;
}

/** Month and day number for a date tile: { month: "Nov", day: "5" }. */
export function slotTile(iso: string, locale: string): { month: string; day: string } {
  const date = new Date(iso);
  return {
    month: new Intl.DateTimeFormat(tag(locale), { timeZone: "Asia/Manila", month: "short" }).format(date),
    day: new Intl.DateTimeFormat(tag(locale), { timeZone: "Asia/Manila", day: "numeric" }).format(date),
  };
}
