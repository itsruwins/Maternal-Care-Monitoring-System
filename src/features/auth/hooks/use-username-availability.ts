"use client";

import { useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { USERNAME_PATTERN } from "@/lib/validation/account-rules";

export type UsernameStatus = "idle" | "checking" | "available" | "taken";

// Live "is this username free?" check, 400 ms after typing stops.
// Uses the public is_username_available() database function (migration 0004),
// called with one plain request: the full Supabase client would add ~60 KB to
// the sign-up page for this single call.
export function useUsernameAvailability(rawUsername: string): UsernameStatus {
  const username = rawUsername.trim().toLowerCase();
  const valid = USERNAME_PATTERN.test(username);
  const [result, setResult] = useState<{ username: string; available: boolean } | null>(null);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const available = await isUsernameAvailable(username);
      if (!cancelled && available !== null) setResult({ username, available });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, valid]);

  if (!valid) return "idle";
  if (result?.username !== username) return "checking";
  return result.available ? "available" : "taken";
}

/** true / false, or null when the check failed (the field then keeps "checking"). */
async function isUsernameAvailable(username: string): Promise<boolean | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_username_available`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_username: username }),
    });
    if (!response.ok) return null;
    return Boolean(await response.json());
  } catch {
    return null;
  }
}
