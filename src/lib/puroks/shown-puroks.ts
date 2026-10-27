import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import type { Database } from "@/types/database";
import { PUROKS_CACHE_TAG, type PurokOption } from "./types";

// The puroks people can choose, in the admin's order. Public data (anyone may
// read shown puroks), so it is read without a session and cached; the admin
// Puroks page expires the cache when it changes anything.
export async function getShownPuroks(): Promise<PurokOption[]> {
  "use cache";
  cacheTag(PUROKS_CACHE_TAG);

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("purok")
    .select("purok_id, name")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    // Retry a failed read soon (e.g. before migration 0008 is run). "minutes"
    // still counts as cacheable, so pages using this can stay prerendered.
    cacheLife("minutes");
    return [];
  }
  cacheLife("days");
  return data.map((row) => ({ id: row.purok_id, name: row.name }));
}
