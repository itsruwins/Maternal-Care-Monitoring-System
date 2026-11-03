import { describe, expect, it } from "vitest";
import { isId, isIdOrNull, isUuid, textArg } from "@/lib/validation/ids";

describe("action argument checks", () => {
  it("isId accepts only positive whole numbers", () => {
    expect(isId(1)).toBe(true);
    expect(isId(Number.MAX_SAFE_INTEGER)).toBe(true);
    for (const value of [0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1, "1", null, undefined, {}]) {
      expect(isId(value), String(value)).toBe(false);
    }
  });

  it("isIdOrNull also accepts null", () => {
    expect(isIdOrNull(null)).toBe(true);
    expect(isIdOrNull(7)).toBe(true);
    expect(isIdOrNull(undefined)).toBe(false);
  });

  it("isUuid accepts only a login id", () => {
    expect(isUuid("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b")).toBe(true);
    for (const value of ["3f2b8c1e9a4d4e6f8b7a1c2d3e4f5a6b", "not-a-uuid", "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b' or 1=1", 42]) {
      expect(isUuid(value), String(value)).toBe(false);
    }
  });

  it("textArg turns anything that isn't text into empty text", () => {
    expect(textArg("hello")).toBe("hello");
    expect(textArg(5)).toBe("");
    expect(textArg(null)).toBe("");
    expect(textArg(["a"])).toBe("");
  });
});
