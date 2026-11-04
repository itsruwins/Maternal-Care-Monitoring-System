import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { NavBadges } from "../nav";

// The staff sidebar's counts: requests from mothers waiting for an answer
// (on Appointments). Read as the logged-in staff member (RLS).
export async function getNavBadges(): Promise<NavBadges> {
  const supabase = await createClient();
  const { count } = await supabase.from("appointment").select("appointment_id", { count: "exact", head: true }).eq("status", "REQUESTED");
  return { appointments: count ?? 0 };
}
