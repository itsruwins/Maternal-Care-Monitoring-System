import "server-only";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { MyAppointment, MyAppointments } from "../types";

const OPEN = new Set(["REQUESTED", "CONFIRMED", "RESCHEDULED"]);

// The mother's appointments (RLS: only her own), split into upcoming (open and
// not yet passed, plus requests still waiting for an answer even after their
// time; proposals first, then by time) and past (newest first).
export async function getMyAppointments(user: CurrentUser): Promise<MyAppointments> {
  const supabase = await createClient();
  const { data: mother } = await supabase.from("mother").select("mother_id").eq("user_id", user.id).maybeSingle();
  if (!mother) return { pregnancyId: null, upcoming: [], past: [] };

  const { data: pregnancies } = await supabase.from("pregnancy").select("pregnancy_id, pregnancy_status").eq("mother_id", mother.mother_id);
  const ids = (pregnancies ?? []).map((p) => p.pregnancy_id);
  const active = (pregnancies ?? []).find((p) => p.pregnancy_status === "ACTIVE")?.pregnancy_id ?? null;
  if (!ids.length) return { pregnancyId: null, upcoming: [], past: [] };

  const { data: rows } = await supabase
    .from("appointment")
    .select("appointment_id, status, requested_datetime, scheduled_datetime, remarks, activity_type:activity_type_id(name)")
    .in("pregnancy_id", ids);

  const now = Date.now();
  const items: MyAppointment[] = (rows ?? []).map((row) => ({
    id: row.appointment_id,
    service: row.activity_type?.name ?? "",
    status: row.status,
    requestedAt: row.requested_datetime,
    scheduledAt: row.scheduled_datetime,
    remarks: row.remarks,
  }));
  const at = (item: MyAppointment) => new Date(item.scheduledAt ?? item.requestedAt).getTime();
  const isUpcoming = (item: MyAppointment) => item.status === "REQUESTED" || (OPEN.has(item.status) && at(item) > now);

  return {
    pregnancyId: active,
    upcoming: items
      .filter(isUpcoming)
      .sort((a, b) => Number(b.status === "RESCHEDULED") - Number(a.status === "RESCHEDULED") || at(a) - at(b)),
    past: items.filter((item) => !isUpcoming(item)).sort((a, b) => at(b) - at(a)),
  };
}
