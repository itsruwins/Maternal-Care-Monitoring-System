// Date and time display helpers (Philippine time).

/** Keeps "9:00 AM" on one line: a no-break space before AM/PM. */
export const keepTimeTogether = (text: string) => text.replace(/\s+(?=[AP]M\b)/g, "\u00a0");

/** A timestamp as date + time in Philippine time, e.g. "Oct 27, 2026, 9:41 AM". */
export function formatDateTime(isoTimestamp: string, locale: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return keepTimeTogether(
    new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  );
}

