// Pregnancy date helpers. Dates are plain "YYYY-MM-DD" strings handled in UTC,
// so time zones never shift a day. These are estimates; the midwife confirms.

const DAY_MS = 24 * 60 * 60 * 1000;
export const PREGNANCY_DAYS = 280; // 40 weeks from the last menstrual period (Naegele's rule)

export function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  const now = new Date();
  // Local calendar date (the user's "today"), expressed as YYYY-MM-DD.
  return toISODate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(iso: string, days: number): string | null {
  const date = parseISODate(iso);
  return date ? toISODate(new Date(date.getTime() + days * DAY_MS)) : null;
}

export function daysBetween(fromISO: string, toISOValue: string): number | null {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISOValue);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** Estimated due date: last period + 280 days. */
export function dueDateFromLmp(lmpISO: string): string | null {
  return addDays(lmpISO, PREGNANCY_DAYS);
}

/** Age of gestation on a given day, as completed weeks + days. */
export function gestationalAge(lmpISO: string, onISO: string = todayISO()) {
  const days = daysBetween(lmpISO, onISO);
  if (days === null || days < 0) return null;
  return { weeks: Math.floor(days / 7), days: days % 7, totalDays: days };
}

/** A last-period date that makes sense for a current pregnancy: not in the future, at most ~44 weeks ago. */
export function isPlausibleLmp(lmpISO: string, onISO: string = todayISO()): boolean {
  const days = daysBetween(lmpISO, onISO);
  return days !== null && days >= 0 && days <= 44 * 7;
}

/** Format a date for display in the chosen language (e.g. "Mar 8, 2027" / "Mar 8, 2027"). */
export function formatDate(iso: string, locale: string, style: "long" | "short" = "long"): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", {
    timeZone: "UTC",
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(date);
}
