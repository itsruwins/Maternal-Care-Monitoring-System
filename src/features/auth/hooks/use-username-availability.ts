"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { USERNAME_PATTERN } from "../schemas";

export type UsernameStatus = "idle" | "checking" | "available" | "taken";

// Live "is this username free?" check, 400 ms after typing stops.
// Uses the public is_username_available() database function (migration 0004).
export function useUsernameAvailability(rawUsername: string): UsernameStatus {
  const username = rawUsername.trim().toLowerCase();
  const valid = USERNAME_PATTERN.test(username);
  const [result, setResult] = useState<{ username: string; available: boolean } | null>(null);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await createClient().rpc("is_username_available", { p_username: username });
      if (!cancelled && !error) setResult({ username, available: Boolean(data) });
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
