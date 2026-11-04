import { describe, expect, it } from "vitest";
import { calendarHref, directionsHref, visitCalendarFile } from "@/lib/appointments/calendar";

const VISIT = {
  id: 7,
  title: "Prenatal Checkup",
  at: "2026-11-05T01:00:00Z",
  location: "Brgy. 56 Taysan, Legazpi City",
  note: "Bring your mother's booklet.",
  stamp: "2026-10-27T02:00:00.000Z",
};

describe("visitCalendarFile", () => {
  it("makes a 30-minute event in UTC with escaped text", () => {
    const ics = visitCalendarFile(VISIT);
    expect(ics).toContain("DTSTART:20261105T010000Z");
    expect(ics).toContain("DTEND:20261105T013000Z");
    expect(ics).toContain("DTSTAMP:20261027T020000Z");
    expect(ics).toContain("UID:appointment-7@taysan-maternacare");
    expect(ics).toContain("LOCATION:Brgy. 56 Taysan\\, Legazpi City");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});

describe("links", () => {
  it("encodes the calendar file and the address", () => {
    expect(calendarHref("A B")).toBe("data:text/calendar;charset=utf-8,A%20B");
    expect(directionsHref("Brgy. 56 Taysan, Legazpi City")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Brgy.%2056%20Taysan%2C%20Legazpi%20City",
    );
  });
});
