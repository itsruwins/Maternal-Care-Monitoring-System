import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  dueDateFromLmp,
  gestationalAge,
  isPlausibleLmp,
  parseISODate,
  trimesterFromWeeks,
  weekOf,
} from "@/lib/utils/pregnancy";

describe("parseISODate", () => {
  it("reads a YYYY-MM-DD date at midnight UTC", () => {
    expect(parseISODate("2026-11-03")?.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(parseISODate("2028-02-29")?.toISOString()).toBe("2028-02-29T00:00:00.000Z");
  });

  it("refuses anything that isn't a YYYY-MM-DD date", () => {
    expect(parseISODate("")).toBeNull();
    expect(parseISODate("2026-1-3")).toBeNull();
    expect(parseISODate("03/11/2026")).toBeNull();
    expect(parseISODate("2026-13-01")).toBeNull();
    expect(parseISODate("2026-11-03T00:00")).toBeNull();
  });

  it("refuses days the month doesn't have", () => {
    expect(parseISODate("2026-02-29")).toBeNull();
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("2026-04-31")).toBeNull();
  });
});

describe("addDays and daysBetween", () => {
  it("count calendar days across months and years", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-01-01", "2027-01-01")).toBe(365);
    expect(daysBetween("2028-01-01", "2029-01-01")).toBe(366);
    expect(daysBetween("2026-11-10", "2026-11-03")).toBe(-7);
  });

  it("give null for a bad date", () => {
    expect(addDays("not a date", 1)).toBeNull();
    expect(daysBetween("2026-11-03", "bad")).toBeNull();
  });
});

describe("dueDateFromLmp (Naegele's rule, LMP + 280 days)", () => {
  it("matches the textbook rule", () => {
    // LMP + 1 year - 3 months + 7 days
    expect(dueDateFromLmp("2026-01-01")).toBe("2026-10-08");
    expect(dueDateFromLmp("2026-05-10")).toBe("2027-02-14");
  });

  it("counts Feb 29 in a leap year", () => {
    expect(dueDateFromLmp("2027-06-01")).toBe("2028-03-07");
  });
});

describe("gestationalAge (AOG)", () => {
  it("gives completed weeks and days", () => {
    expect(gestationalAge("2026-01-01", "2026-01-01")).toEqual({ weeks: 0, days: 0, totalDays: 0 });
    expect(gestationalAge("2026-01-01", "2026-03-12")).toEqual({ weeks: 10, days: 0, totalDays: 70 });
    expect(gestationalAge("2026-01-01", "2026-03-15")).toEqual({ weeks: 10, days: 3, totalDays: 73 });
    expect(gestationalAge("2026-01-01", "2026-10-08")).toEqual({ weeks: 40, days: 0, totalDays: 280 });
  });

  it("is null before the last period or for a bad date", () => {
    expect(gestationalAge("2026-11-04", "2026-11-03")).toBeNull();
    expect(gestationalAge("bad", "2026-11-03")).toBeNull();
  });
});

describe("isPlausibleLmp", () => {
  const today = "2026-11-03";
  it("allows today up to 44 weeks ago", () => {
    expect(isPlausibleLmp(today, today)).toBe(true);
    expect(isPlausibleLmp(addDays(today, -308)!, today)).toBe(true);
  });

  it("refuses the future, over 44 weeks ago, and bad dates", () => {
    expect(isPlausibleLmp(addDays(today, 1)!, today)).toBe(false);
    expect(isPlausibleLmp(addDays(today, -309)!, today)).toBe(false);
    expect(isPlausibleLmp("bad", today)).toBe(false);
  });
});

describe("trimesterFromWeeks", () => {
  it("1st up to week 13, 2nd weeks 14-27, 3rd from week 28", () => {
    expect([0, 13, 14, 27, 28, 42].map(trimesterFromWeeks)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe("weekOf", () => {
  it("gives the Sunday-to-Saturday week", () => {
    expect(weekOf("2026-11-04")).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
    expect(weekOf("2026-11-01")[0]).toBe("2026-11-01");
    expect(weekOf("bad")).toEqual([]);
  });
});
