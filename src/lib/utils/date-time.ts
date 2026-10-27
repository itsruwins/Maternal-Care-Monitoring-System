// Date and time display helpers (Philippine time).
/** A timestamp as date + time in Philippine time, e.g. "Oct 27, 2026, 9:41 AM". */
export function formatDateTime(isoTimestamp: string, locale: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

