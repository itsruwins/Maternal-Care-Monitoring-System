import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  addMonths,
  bookingWindow,
  firstOpenDay,
  formatSlotTime,
  isSlotTime,
  isWeekday,
  manilaSlot,
  SLOT_TIMES,
  slotErrorOf,
  slotInstant,
  slotKey,
} from "@/lib/appointments/slots";

describe("slot times", () => {
  it("are 30 minutes apart, 8:00-11:30 and 1:00-2:30", () => {
    expect(SLOT_TIMES).toEqual(["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"]);
    expect(isSlotTime("09:30")).toBe(true);
    expect(["07:30", "12:00", "12:30", "15:00", "09:15", "9:00"].some(isSlotTime)).toBe(false);
  });

  it("use the same hours and minutes as the database (migration 0009)", () => {
    const sql = readFileSync("supabase/migrations/0009_phase4.sql", "utf8");
    const hours = sql.match(/extract\(hour from local_time\) not in \(([^)]*)\)/)![1].split(",").map((h) => Number(h));
    const minutes = sql.match(/extract\(minute from local_time\) not in \(([^)]*)\)/)![1].split(",").map((m) => Number(m));
    const fromApp = (part: 0 | 1) => [...new Set(SLOT_TIMES.map((time) => Number(time.split(":")[part])))];
    expect(fromApp(0)).toEqual(hours);
    expect(fromApp(1)).toEqual(minutes);
  });
});

describe("Manila time", () => {
  it("writes a slot as a Manila instant", () => {
    expect(slotInstant("2026-11-05", "09:00")).toBe("2026-11-05T09:00:00+08:00");
  });

  it("reads an instant back as the Manila date and time", () => {
    expect(manilaSlot("2026-11-05T09:00:00+08:00")).toEqual({ date: "2026-11-05", time: "09:00" });
    // 4:30 PM UTC is already the next day in Manila.
    expect(manilaSlot("2026-11-04T16:30:00Z")).toEqual({ date: "2026-11-05", time: "00:30" });
    expect(manilaSlot("2026-11-05T06:30:00Z")).toEqual({ date: "2026-11-05", time: "14:30" });
  });

  it("shows a slot time with AM/PM kept on the same line", () => {
    expect(formatSlotTime("09:00", "en")).toBe("9:00 AM");
    expect(formatSlotTime("14:30", "en")).toBe("2:30 PM");
    expect(formatSlotTime("14:30", "fil")).not.toMatch(/ [AP]M/);
  });
});

describe("open days", () => {
  it("are Monday to Friday", () => {
    // 2026-11-02 is a Monday.
    expect(["2026-11-02", "2026-11-03", "2026-11-06"].every(isWeekday)).toBe(true);
    expect(["2026-11-07", "2026-11-08", "bad"].some(isWeekday)).toBe(false);
  });

  it("firstOpenDay skips weekends, closed days and full days", () => {
    const fullTuesday = SLOT_TIMES.map((time) => slotKey("2026-11-10", time));
    // From Saturday: Monday is closed, Tuesday is full, so Wednesday.
    expect(firstOpenDay("2026-11-07", { last: "2026-11-30", closedDays: ["2026-11-09"], taken: fullTuesday })).toBe("2026-11-11");
    // One free time is enough.
    expect(firstOpenDay("2026-11-10", { last: "2026-11-30", closedDays: [], taken: fullTuesday.slice(1) })).toBe("2026-11-10");
    // Nothing open before the last day.
    expect(firstOpenDay("2026-11-07", { last: "2026-11-10", closedDays: ["2026-11-09"], taken: fullTuesday })).toBeNull();
  });
});

describe("booking window", () => {
  it("adds months like Postgres (end of month is kept in range)", () => {
    expect(addMonths("2026-08-15", 3)).toBe("2026-11-15");
    expect(addMonths("2026-11-30", 3)).toBe("2027-02-28");
    expect(addMonths("2027-11-30", 3)).toBe("2028-02-29");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("runs from tomorrow to 3 months ahead", () => {
    expect(bookingWindow("2026-11-03")).toEqual({ first: "2026-11-04", last: "2027-02-03" });
    expect(bookingWindow("2026-12-31")).toEqual({ first: "2027-01-01", last: "2027-03-31" });
  });
});

describe("slotErrorOf", () => {
  it("maps database errors to our codes", () => {
    expect(slotErrorOf({ code: "23505", message: "duplicate key value" })).toBe("slot_taken");
    expect(slotErrorOf({ code: "22023", message: "slot_closed" })).toBe("slot_closed");
    expect(slotErrorOf({ code: "22023", message: "outside_window" })).toBe("outside_window");
    expect(slotErrorOf({ code: "P0002", message: "not_found" })).toBe("not_found");
    expect(slotErrorOf({ code: "XX000", message: "something else" })).toBe("generic");
    expect(slotErrorOf(null)).toBe("generic");
  });
});
