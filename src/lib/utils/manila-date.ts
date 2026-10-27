// Calendar dates for the health center (Philippine time).
/** Today's date in the Philippines as "YYYY-MM-DD" (servers run on UTC, a day behind in the morning). */
export function manilaTodayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** A "YYYY-MM" month as words, e.g. "March 2027". */
export function formatMonth(yearMonth: string, locale: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  if (!year || !month) return yearMonth;
  return new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "UTC", year: "numeric", month: "long" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
