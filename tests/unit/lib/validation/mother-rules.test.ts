import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { countField, isPlausibleBirthDate, isPlausibleDueDate, lmpField } from "@/lib/validation/mother-rules";

const today = "2026-11-03";

describe("isPlausibleBirthDate", () => {
  it("allows mothers from 10 to 60 years old", () => {
    expect(isPlausibleBirthDate("2000-01-01", today)).toBe(true);
    expect(isPlausibleBirthDate("2016-01-01", today)).toBe(true);
    expect(isPlausibleBirthDate("1967-01-01", today)).toBe(true);
  });

  it("refuses younger than 10, older than 60, the future and bad dates", () => {
    expect(isPlausibleBirthDate("2020-01-01", today)).toBe(false);
    expect(isPlausibleBirthDate("1960-01-01", today)).toBe(false);
    expect(isPlausibleBirthDate("2027-01-01", today)).toBe(false);
    expect(isPlausibleBirthDate("bad", today)).toBe(false);
  });
});

describe("isPlausibleDueDate", () => {
  it("allows 2 weeks ago up to 300 days ahead", () => {
    expect(isPlausibleDueDate("2026-10-20", today)).toBe(true); // 14 days ago
    expect(isPlausibleDueDate("2027-08-30", today)).toBe(true); // 300 days ahead
  });

  it("refuses earlier, later and bad dates", () => {
    expect(isPlausibleDueDate("2026-10-19", today)).toBe(false); // 15 days ago
    expect(isPlausibleDueDate("2027-08-31", today)).toBe(false); // 301 days ahead
    expect(isPlausibleDueDate("bad", today)).toBe(false);
  });
});

describe("countField (gravida, para)", () => {
  const gravida = countField("gravidaInvalid", 1);
  const para = countField("paraInvalid", 0);

  it("turns a small whole number into a number", () => {
    expect(gravida.parse("2")).toBe(2);
    expect(gravida.parse(" 3 ")).toBe(3);
    expect(para.parse("0")).toBe(0);
  });

  it("refuses below the minimum, non-numbers and more than 2 digits", () => {
    for (const value of ["0", "", "abc", "1.5", "-1", "123"]) {
      const result = gravida.safeParse(value);
      expect(result.success, value).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe("gravidaInvalid");
    }
  });
});

describe("lmpField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 12, 0)); // Nov 3, 2026, noon local time
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows empty or a date in the last 44 weeks", () => {
    expect(lmpField.safeParse("").success).toBe(true);
    expect(lmpField.safeParse("2026-09-01").success).toBe(true);
    expect(lmpField.safeParse("2026-11-03").success).toBe(true);
  });

  it("refuses the future, too long ago and bad dates", () => {
    for (const value of ["2026-11-04", "2025-12-01", "bad", "2026-02-30"]) {
      const result = lmpField.safeParse(value);
      expect(result.success, value).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe("lmpInvalid");
    }
  });
});
