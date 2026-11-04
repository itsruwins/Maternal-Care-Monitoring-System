import "server-only";
import { toServiceIcon } from "@/lib/appointments/service-icons";
import { manilaSlot } from "@/lib/appointments/slots";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import type { MyAppointment, MyAppointments, MyReminder } from "../types";

const OPEN = new Set(["REQUESTED", "CONFIRMED", "RESCHEDULED"]);

// The mother's appointments (RLS: only her own), split into upcoming (open and
// on today or later, plus requests still waiting for an answer even after their
// time; proposals first, then by time) and past (newest first). Confirmed
// visits carry their latest reminder text (RLS: she can read her own).
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
    .select("appointment_id, status, requested_datetime, scheduled_datetime, remarks, activity_type:activity_type_id(name, icon)")
    .in("pregnancy_id", ids);

  const confirmed = (rows ?? []).filter((row) => row.status === "CONFIRMED").map((row) => row.appointment_id);
  const { data: reminders } = confirmed.length
    ? await supabase
        .from("sms_reminder")
        .select("appointment_id, delivery_status, scheduled_at, sent_at, next_attempt_at, recipient_number, status_reason")
        .eq("reminder_type", "UPCOMING")
        .in("appointment_id", confirmed)
        .order("reminder_id", { ascending: false })
    : { data: [] };
  const latest = new Map<number, MyReminder>();
  for (const r of reminders ?? []) {
    if (latest.has(r.appointment_id)) continue;
    latest.set(r.appointment_id, {
      status: r.delivery_status,
      at: r.next_attempt_at ?? r.scheduled_at,
      sentAt: r.sent_at,
      number: r.recipient_number,
      reason: r.status_reason,
    });
  }

  const today = manilaTodayISO();
  const items: MyAppointment[] = (rows ?? []).map((row) => ({
    id: row.appointment_id,
    service: row.activity_type?.name ?? "",
    icon: toServiceIcon(row.activity_type?.icon),
    status: row.status,
    requestedAt: row.requested_datetime,
    scheduledAt: row.scheduled_datetime,
    remarks: row.remarks,
    reminder: row.status === "CONFIRMED" ? (latest.get(row.appointment_id) ?? null) : null,
  }));
  const at = (item: MyAppointment) => new Date(item.scheduledAt ?? item.requestedAt).getTime();
  // Open visits stay under Upcoming until the end of their day (Manila), so a
  // confirmed visit from this morning never sits in Past looking unfinished.
  const isUpcoming = (item: MyAppointment) =>
    item.status === "REQUESTED" || (OPEN.has(item.status) && manilaSlot(item.scheduledAt ?? item.requestedAt).date >= today);

  return {
    pregnancyId: active,
    upcoming: items
      .filter(isUpcoming)
      .sort((a, b) => Number(b.status === "RESCHEDULED") - Number(a.status === "RESCHEDULED") || at(a) - at(b)),
    past: items.filter((item) => !isUpcoming(item)).sort((a, b) => at(b) - at(a)),
  };
}
