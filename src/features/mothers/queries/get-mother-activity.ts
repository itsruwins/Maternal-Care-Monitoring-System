import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus } from "@/types/database";
import type { MotherActivity, MotherEvent } from "../types";

/** How many events the Overview lists. */
export const RECENT_EVENTS = 5;

/** Appointments still ahead of her: the next one is the soonest of these. */
const AHEAD: ReadonlySet<AppointmentStatus> = new Set(["REQUESTED", "CONFIRMED", "RESCHEDULED"]);

// Her next appointment, her last visit and her five latest events (visits,
// appointments asked for, booked, missed or cancelled, texts that went out or
// failed, follow-ups), across all her pregnancies. Read as the logged-in staff
// member (RLS).
export async function getMotherActivity(pregnancyIds: number[], now: string): Promise<MotherActivity> {
  if (!pregnancyIds.length) return { next: null, last: null, events: [] };
  const supabase = await createClient();
  const [{ data: appointments }, { data: visits }] = await Promise.all([
    supabase
      .from("appointment")
      .select("appointment_id, status, requested_datetime, scheduled_datetime, created_at, updated_at, activity_type:activity_type_id(name)")
      .in("pregnancy_id", pregnancyIds),
    supabase
      .from("prenatal_visit")
      .select("visit_id, visit_datetime, aog_weeks, visit_service(activity_type:activity_type_id(name))")
      .in("pregnancy_id", pregnancyIds)
      .order("visit_datetime", { ascending: false })
      .limit(RECENT_EVENTS),
  ]);

  const appointmentIds = (appointments ?? []).map((row) => row.appointment_id);
  const [{ data: texts }, { data: followUps }] = appointmentIds.length
    ? await Promise.all([
        supabase
          .from("sms_reminder")
          .select("reminder_id, reminder_type, delivery_status, sent_at, scheduled_at")
          .in("appointment_id", appointmentIds)
          .in("delivery_status", ["SENT", "DELIVERED", "FAILED"])
          .order("reminder_id", { ascending: false })
          .limit(RECENT_EVENTS),
        supabase
          .from("follow_up")
          .select("follow_up_id, follow_up_date, method, result, created_at")
          .in("appointment_id", appointmentIds)
          .order("created_at", { ascending: false })
          .limit(RECENT_EVENTS),
      ])
    : [{ data: [] }, { data: [] }];

  const booked = (appointments ?? []).map((row) => ({
    id: row.appointment_id,
    status: row.status,
    service: row.activity_type?.name ?? "",
    at: row.scheduled_datetime ?? row.requested_datetime,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  // Timestamps compared as instants (the database writes +00:00, `now` ends in Z).
  const time = (iso: string) => Date.parse(iso);
  const nowTime = time(now);
  const next = booked.filter((row) => AHEAD.has(row.status) && time(row.at) >= nowTime).sort((a, b) => time(a.at) - time(b.at))[0] ?? null;
  const visitRows = (visits ?? []).map((row) => ({
    id: row.visit_id,
    at: row.visit_datetime,
    weeks: row.aog_weeks,
    services: row.visit_service.map((s) => s.activity_type?.name ?? "").filter(Boolean),
  }));

  const events: MotherEvent[] = [
    ...visitRows.map((row) => ({ kind: "visit" as const, id: `v${row.id}`, at: row.at, weeks: row.weeks, services: row.services })),
    // A completed appointment shows as its visit.
    ...booked
      .filter((row) => row.status !== "COMPLETED")
      .map((row) => ({
        kind: "appointment" as const,
        id: `a${row.id}`,
        at: row.status === "MISSED" ? row.at : row.status === "REQUESTED" ? row.createdAt : row.updatedAt,
        status: row.status,
        service: row.service,
        visitAt: row.at,
      })),
    ...(texts ?? []).map((row) => ({
      kind: "text" as const,
      id: `t${row.reminder_id}`,
      at: row.sent_at ?? row.scheduled_at,
      type: row.reminder_type,
      status: row.delivery_status,
    })),
    ...(followUps ?? []).map((row) => ({
      kind: "followUp" as const,
      id: `f${row.follow_up_id}`,
      at: row.created_at,
      method: row.method,
      result: row.result,
    })),
  ];

  return {
    next: next ? { at: next.at, service: next.service, status: next.status } : null,
    last: visitRows[0] ? { at: visitRows[0].at, weeks: visitRows[0].weeks, services: visitRows[0].services } : null,
    events: events
      .filter((event) => time(event.at) <= nowTime)
      .sort((a, b) => time(b.at) - time(a.at))
      .slice(0, RECENT_EVENTS),
  };
}
