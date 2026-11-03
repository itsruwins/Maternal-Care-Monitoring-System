import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth/safe-next";

const base = "https://app.example/en/auth/callback";
const fallback = "/en/login";
const next = (value: string | null) => safeNext(value, base, fallback).href;

describe("safeNext (where a sign-in link may send someone)", () => {
  it("keeps a path on this site, with its query", () => {
    expect(next("/en/reset-password")).toBe("https://app.example/en/reset-password");
    expect(next("/fil/mother?tab=visits")).toBe("https://app.example/fil/mother?tab=visits");
  });

  it("sends links to other sites to the fallback", () => {
    for (const value of ["https://evil.example/", "//evil.example/x", "/\\evil.example", "\\\\evil.example", "javascript:alert(1)", "evil.example"]) {
      expect(next(value), value).toBe("https://app.example/en/login");
    }
  });

  it("uses the fallback when there is no link", () => {
    expect(next(null)).toBe("https://app.example/en/login");
    expect(next("")).toBe("https://app.example/en/login");
  });

  it("keeps encoded tricks on this site", () => {
    expect(new URL(next("/%2F%2Fevil.example")).origin).toBe("https://app.example");
  });
});
