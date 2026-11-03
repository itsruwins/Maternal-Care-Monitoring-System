import { describe, expect, it } from "vitest";
import { checkSmsText, MAX_PARTS, toInternational } from "@/features/sms/text-rules";

describe("checkSmsText length", () => {
  it("fits 160 plain characters in one text", () => {
    expect(checkSmsText("a".repeat(160))).toEqual({ ok: true, parts: 1 });
  });

  it("splits longer texts into parts of 153", () => {
    expect(checkSmsText("a".repeat(161))).toEqual({ ok: true, parts: 2 });
    expect(checkSmsText("a".repeat(306))).toEqual({ ok: true, parts: 2 });
  });

  it("refuses anything over 2 parts", () => {
    expect(MAX_PARTS).toBe(2);
    expect(checkSmsText("a".repeat(307))).toEqual({ ok: false, reason: "too_long" });
  });

  it("counts extended characters ([ ] { } ~ € …) as two", () => {
    expect(checkSmsText("[".repeat(80))).toEqual({ ok: true, parts: 1 });
    expect(checkSmsText("[".repeat(81))).toEqual({ ok: true, parts: 2 });
    expect(checkSmsText("€".repeat(153))).toEqual({ ok: true, parts: 2 });
    expect(checkSmsText("€".repeat(154))).toEqual({ ok: false, reason: "too_long" });
  });
});

describe("checkSmsText characters", () => {
  it("allows plain text, including ñ and new lines", () => {
    expect(checkSmsText("Magandang araw, Ma'am! Paalala: checkup bukas, 9:00 AM.\nSalamat - Brgy. Señora")).toEqual({ ok: true, parts: 1 });
  });

  it("refuses characters a plain text can't carry", () => {
    for (const text of ["Don’t", "“quoted”", "9:00 AM", "Ingat 😊", "Á", "naïve…"]) {
      expect(checkSmsText(text), text).toEqual({ ok: false, reason: "bad_characters" });
    }
  });
});

describe("toInternational", () => {
  it("turns 09XXXXXXXXX into +639XXXXXXXXX", () => {
    expect(toInternational("09171234567")).toBe("+639171234567");
  });

  it("is null for anything else", () => {
    for (const value of ["9171234567", "+639171234567", "0917123456", "091712345678", "0917 123 4567", ""]) {
      expect(toInternational(value), value).toBeNull();
    }
  });
});
