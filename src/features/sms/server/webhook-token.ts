import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Checks the token HTTPSMS puts on every webhook call (Authorization: Bearer
// <JWT>): signed HS256 with the webhook's signing key, issued by
// api.httpsms.com, for our webhook address, and inside its time window
// (HTTPSMS makes it valid from 10 minutes before to 10 minutes after sending).

const ISSUER = "api.httpsms.com";
const WEBHOOK_PATH = "/api/webhooks/httpsms";
const LEEWAY_S = 60; // clock difference allowed between HTTPSMS and us

type Claims = { iss?: unknown; aud?: unknown; exp?: unknown; nbf?: unknown };

export function validWebhookToken(token: string, key: string, nowMs = Date.now()): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;

  const head = decodePart(header) as { alg?: unknown } | null;
  if (head?.alg !== "HS256") return false;
  const expected = createHmac("sha256", key).update(`${header}.${payload}`).digest();
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;

  const claims = decodePart(payload) as Claims | null;
  if (!claims || claims.iss !== ISSUER) return false;
  const now = nowMs / 1000;
  if (typeof claims.exp !== "number" || claims.exp + LEEWAY_S < now) return false;
  if (typeof claims.nbf === "number" && claims.nbf - LEEWAY_S > now) return false;
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  return audiences.some((aud) => typeof aud === "string" && pathOf(aud) === WEBHOOK_PATH);
}

function decodePart(part: string): unknown {
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function pathOf(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/\/$/, "");
  } catch {
    return null;
  }
}
