import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MissedVisit } from "../types";

// The logged-in mother's missed visits that are still open, oldest first
// (my_open_missed_visits(): her own only, never the staff's notes). One closes
// once she has a new booking or a visit, her pregnancy closes or staff close it.
export async function getMyMissedVisits(): Promise<MissedVisit[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_open_missed_visits");
  return (data ?? []).map((row) => ({ id: row.appointment_id, service: row.service, at: row.missed_at }));
}
