import { describe, expect, it } from "vitest";
import { trimesterFill, trimesterRanges, weeklyTip } from "@/features/mother-home/pregnancy-guide";

const TIPS = { first: ["a1", "a2"], second: ["b1", "b2", "b3"], third: ["c1", "c2"] };

describe("weeklyTip", () => {
  it("picks from her trimester's set and changes each week", () => {
    expect(weeklyTip(TIPS, "late", 6, false)).toBe("a1");
    expect(weeklyTip(TIPS, "late", 7, false)).toBe("a2");
    expect(weeklyTip(TIPS, "late", 14, false)).toBe("b3");
    expect(weeklyTip(TIPS, "late", 15, false)).toBe("b1");
    expect(weeklyTip(TIPS, "late", 30, false)).toBe("c1");
  });

  it("shows the past-due message once her due date has passed", () => {
    expect(weeklyTip(TIPS, "late", 41, true)).toBe("late");
  });
});

describe("trimesterRanges", () => {
  it("splits at weeks 14 and 28 and ends on the due date", () => {
    expect(trimesterRanges("2026-01-01", "2026-10-08")).toEqual([
      { trimester: 1, from: "2026-01-01", to: "2026-04-08" },
      { trimester: 2, from: "2026-04-09", to: "2026-07-15" },
      { trimester: 3, from: "2026-07-16", to: "2026-10-08" },
    ]);
  });

  it("uses LMP + 280 days when the due date is unknown", () => {
    expect(trimesterRanges("2026-01-01", null)?.[2].to).toBe("2026-10-08");
  });
});

describe("trimesterFill", () => {
  it("fills the parts in order", () => {
    expect(trimesterFill(0)).toEqual([0, 0, 0]);
    expect(trimesterFill(49)).toEqual([0.5, 0, 0]);
    expect(trimesterFill(98)).toEqual([1, 0, 0]);
    expect(trimesterFill(238)).toEqual([1, 1, 0.5]);
  });

  it("stays full past 40 weeks", () => {
    expect(trimesterFill(320)).toEqual([1, 1, 1]);
  });
});
