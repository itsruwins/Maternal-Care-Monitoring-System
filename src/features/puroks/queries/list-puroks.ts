import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Purok } from "../types";

// Every purok, shown and hidden, in list order (admins only, by RLS).
export async function listPuroks(): Promise<Purok[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("purok")
    .select("purok_id, name, is_active")
    .order("sort_order")
    .order("name");
  return (data ?? []).map((row) => ({ id: row.purok_id, name: row.name, isActive: row.is_active }));
}
