import { describe, expect, it } from "vitest";
import { inputMaxLength, MAX_LENGTH, MIN_PASSWORD_LENGTH, MOBILE_PATTERN, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";

describe("usernames", () => {
  it("allow 8-30 lowercase letters, numbers, dots and underscores", () => {
    for (const name of ["maria.santos", "abcdefgh", "juana_dc2", "a".repeat(30), "taysan.admin"]) {
      expect(USERNAME_PATTERN.test(name), name).toBe(true);
    }
  });

  it("refuse short, long, uppercase, spaced or badly started/ended names", () => {
    for (const name of ["abcdefg", "a".repeat(31), "Maria.Santos", "maria santos", ".mariasantos", "mariasantos_", "maria-santos", "maría.santos"]) {
      expect(USERNAME_PATTERN.test(name), name).toBe(false);
    }
  });

  it("are always long enough to be a default password", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(USERNAME_PATTERN.test("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
    expect(USERNAME_PATTERN.test("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
  });
});

describe("mobile numbers", () => {
  it("normalize common ways of writing a number", () => {
    expect(normalizeMobile("0917 123-4567")).toBe("09171234567");
    expect(normalizeMobile("+63 917 123 4567")).toBe("09171234567");
    expect(normalizeMobile("639171234567")).toBe("09171234567");
    expect(normalizeMobile("(0917) 123.4567")).toBe("09171234567");
  });

  it("accept only 11 digits starting with 09", () => {
    expect(MOBILE_PATTERN.test("09171234567")).toBe(true);
    for (const value of ["9171234567", "0917123456", "091712345678", "08171234567", "+639171234567"]) {
      expect(MOBILE_PATTERN.test(value), value).toBe(false);
    }
    expect(MOBILE_PATTERN.test(normalizeMobile("12345"))).toBe(false);
  });
});

describe("length limits", () => {
  it("cap passwords at 72 (the Supabase Auth limit)", () => {
    expect(MAX_LENGTH.password).toBe(72);
    expect(inputMaxLength("password")).toBe(72);
    expect(inputMaxLength("confirmPassword")).toBe(72);
  });

  it("give form fields the same limits as the schemas", () => {
    expect(inputMaxLength("firstName")).toBe(MAX_LENGTH.namePart);
    expect(inputMaxLength("emergencyName")).toBe(MAX_LENGTH.fullName);
    expect(inputMaxLength("street")).toBe(MAX_LENGTH.street);
    expect(inputMaxLength("email")).toBe(254);
    expect(inputMaxLength("somethingElse")).toBeUndefined();
  });
});
