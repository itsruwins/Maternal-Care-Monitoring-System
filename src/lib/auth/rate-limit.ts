import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/supabase/env";
import type { RateLimitHitRow } from "@/types/database";

// Abuse limits per network address (Phase 9, migration 0023). Logins and
// sign-ups reach Supabase from this one server, so its own limits count all
// users together; these count each address on its own. Many phones share one
// address (mobile networks, the health center Wi-Fi), so the limits are generous.
// The address is never stored: only a keyed hash (RATE_LIMIT_SECRET).

export type RateLimitAction = RateLimitHitRow["action"];

export const RATE_LIMITS: Record<RateLimitAction, { limit: number; windowMinutes: number }> = {
  login: { limit: 20, windowMinutes: 15 }, // failed tries only
  signup: { limit: 20, windowMinutes: 60 },
  reset: { limit: 10, windowMinutes: 60 },
};

/** The visitor's address as a keyed hash. On Vercel, x-forwarded-for is set by Vercel itself. */
async function addressKey(): Promise<string> {
  const h = await headers();
  const address = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  const secret = requireEnv(process.env.RATE_LIMIT_SECRET, "RATE_LIMIT_SECRET");
  return createHmac("sha256", secret).update(address).digest("hex");
}

/**
 * Minutes this address must wait before trying `action` again; 0 when it may go ahead.
 * If the log can't be read, the try is allowed (the username lock and the
 * database rules still apply), so an outage never locks everyone out.
 */
export async function rateLimitWait(action: RateLimitAction): Promise<number> {
  const { limit, windowMinutes } = RATE_LIMITS[action];
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { data, error } = await createAdminClient()
    .from("rate_limit_hit")
    .select("hit_at")
    .eq("action", action)
    .eq("key_hash", await addressKey())
    .gte("hit_at", since)
    .order("hit_at", { ascending: false })
    .limit(limit);
  if (error || !data || data.length < limit) return 0;
  // Free again once the oldest of the last `limit` tries leaves the window.
  const freeAt = new Date(data[data.length - 1].hit_at).getTime() + windowMinutes * 60_000;
  return Math.max(1, Math.ceil((freeAt - Date.now()) / 60_000));
}

/** Counts one try of `action` from this address. */
export async function recordRateLimitHit(action: RateLimitAction): Promise<void> {
  await createAdminClient().from("rate_limit_hit").insert({ action, key_hash: await addressKey() });
}
