import { addDays, parseISODate, toISODate } from "@/lib/utils/pregnancy";

// Appointment slots (same rules as migration 0009): 30 minutes, Monday to
// Friday, 8:00-11:30 and 1:00-2:30 Manila time; one appointment per slot.
// Times are written as "HH:MM" (24-hour) and dates as "YYYY-MM-DD", both in
// Manila time. The database stores the instant (timestamptz).

export const SLOT_TIMES = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"] as const;
export type SlotTime = (typeof SLOT_TIMES)[number];

/** Mothers can request from tomorrow up to this many months ahead. */
export const BOOKING_MONTHS_AHEAD = 3;

export function isSlotTime(value: string): value is SlotTime {
  return (SLOT_TIMES as readonly string[]).includes(value);
}

/** The instant for a Manila date and slot time, e.g. "2026-11-05T09:00:00+08:00". */
export function slotInstant(date: string, time: string): string {
  return `${date}T${time}:00+08:00`;
}

/** Manila "YYYY-MM-DD" and "HH:MM" for an instant. */
export function manilaSlot(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** "YYYY-MM-DDTHH:MM" key used to look up taken slots. */
export const slotKey = (date: string, time: string) => `${date}T${time}`;

export function isWeekday(date: string): boolean {
  const day = parseISODate(date)?.getUTCDay();
  return day !== undefined && day !== 0 && day !== 6;
}

/** Add months like Postgres does (Nov 30 + 3 months = Feb 28). */
export function addMonths(date: string, months: number): string {
  const d = parseISODate(date)!;
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), lastDay));
  return toISODate(target);
}

/** The dates a mother may request: tomorrow to 3 months ahead (Manila). */
export function bookingWindow(today: string): { first: string; last: string } {
  return { first: addDays(today, 1)!, last: addMonths(today, BOOKING_MONTHS_AHEAD) };
}

/** "9:00 AM" for "09:00". */
export function formatSlotTime(time: string, locale: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(
    new Date(Date.UTC(2000, 0, 1, hour, minute)),
  );
}

/** Error codes the database raises for appointments (migration 0009). */
export const SLOT_ERRORS = ["slot_invalid", "slot_closed", "slot_past", "outside_window", "no_active_pregnancy", "too_late_to_cancel", "not_found"] as const;
export type SlotError = (typeof SLOT_ERRORS)[number] | "slot_taken" | "generic";

/** Map a Supabase error to one of our codes. */
export function slotErrorOf(error: { code?: string; message?: string } | null): SlotError {
  if (!error) return "generic";
  if (error.code === "23505") return "slot_taken";
  const code = SLOT_ERRORS.find((known) => error.message?.includes(known));
  return code ?? "generic";
}
