// A visit as a calendar file (.ics) she can open in Google Calendar, Apple
// Calendar or Outlook, and a Google Maps link to the health center.

/** One visit slot, in minutes (the booking times are 30 minutes apart). */
export const VISIT_MINUTES = 30;

/** "20261105T010000Z": an ISO time in the calendar file's UTC form. */
function icsTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Commas, semicolons, backslashes and line breaks are escaped in calendar text. */
function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function visitCalendarFile(visit: { id: number; title: string; at: string; location: string; note: string; stamp: string }): string {
  const start = new Date(visit.at);
  const end = new Date(start.getTime() + VISIT_MINUTES * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Taysan MaternaCare//Visits//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:appointment-${visit.id}@taysan-maternacare`,
    `DTSTAMP:${icsTime(new Date(visit.stamp))}`,
    `DTSTART:${icsTime(start)}`,
    `DTEND:${icsTime(end)}`,
    `SUMMARY:${icsText(visit.title)}`,
    `LOCATION:${icsText(visit.location)}`,
    `DESCRIPTION:${icsText(visit.note)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** The calendar file as a link that downloads it (no server round trip). */
export function calendarHref(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/** Google Maps search for the health center's address. */
export function directionsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
