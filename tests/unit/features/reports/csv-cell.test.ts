import { describe, expect, it } from "vitest";
import { csvCell } from "@/features/reports/csv-cell";

describe("csvCell defusing", () => {
  it("stops text a spreadsheet would run as a formula", () => {
    expect(csvCell("=1+1")).toBe("'=1+1");
    expect(csvCell("+639171234567")).toBe("'+639171234567");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell("-cmd")).toBe("'-cmd");
    expect(csvCell("\tx")).toBe("'\tx");
    expect(csvCell("\rx")).toBe("\"'\rx\"");
  });

  it("defuses and quotes a formula with commas and quotes", () => {
    expect(csvCell('=HYPERLINK("http://x.example","Click")')).toBe('"\'=HYPERLINK(""http://x.example"",""Click"")"');
  });

  it("leaves numbers, negative numbers and ordinary text alone", () => {
    expect(csvCell(12)).toBe("12");
    expect(csvCell(-5)).toBe("-5");
    expect(csvCell("-5")).toBe("-5");
    expect(csvCell("Dela Cruz, Maria")).toBe('"Dela Cruz, Maria"');
    expect(csvCell("Purok 3 - Señora")).toBe("Purok 3 - Señora");
    expect(csvCell("2026-11-05")).toBe("2026-11-05");
  });
});

describe("csvCell quoting", () => {
  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  it("writes an empty cell for null", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell("")).toBe("");
  });
});
