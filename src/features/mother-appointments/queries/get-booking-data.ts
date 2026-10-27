import "server-only";
import { bookingWindow, manilaSlot, slotKey } from "@/lib/appointments/slots";
import { createClient } from "@/lib/supabase/server";
import type { BookingData } from "../types";

// Services, closed days and taken slots for the mother's booking window
// (tomorrow to 3 months ahead). taken_slots() returns only times, never who.
export async function getBookingData(today: string): Promise<BookingData> {
  const { first, last } = bookingWindow(today);
  const supabase = await createClient();
  const [{ data: services }, { data: closed }, { data: taken }] = await Promise.all([
    supabase.from("activity_type").select("activity_type_id, name, description").order("activity_type_id"),
    supabase.from("closed_day").select("closed_date").gte("closed_date", first).lte("closed_date", last),
    supabase.rpc("taken_slots", { p_from: first, p_to: last }),
  ]);
  return {
    services: (services ?? []).map((s) => ({ id: s.activity_type_id, name: s.name, description: s.description })),
    today,
    first,
    last,
    closedDays: (closed ?? []).map((c) => c.closed_date),
    taken: (taken ?? []).map((iso) => {
      const slot = manilaSlot(iso);
      return slotKey(slot.date, slot.time);
    }),
  };
}
