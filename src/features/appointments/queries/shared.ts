import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { StaffAppointment } from "../types";

type Client = Awaited<ReturnType<typeof createClient>>;

/** Columns for a staff appointment row, with the mother and the service. */
export const APPOINTMENT_SELECT =
  "appointment_id, status, requested_datetime, scheduled_datetime, remarks, created_at, activity_type:activity_type_id(name), pregnancy:pregnancy_id(mother:mother_id(mother_id, first_name, middle_name, last_name, contact_number, user_id))";

type Row = {
  appointment_id: number;
  status: StaffAppointment["status"];
  requested_datetime: string;
  scheduled_datetime: string | null;
  remarks: string | null;
  created_at: string;
  activity_type: { name: string } | null;
  pregnancy: {
    mother: { mother_id: number; first_name: string; middle_name: string | null; last_name: string; contact_number: string; user_id: string | null } | null;
  } | null;
};

/** Rows → appointments, with each one's latest upcoming-visit reminder (the newest one queued). */
export async function toAppointments(supabase: Client, rows: Row[]): Promise<StaffAppointment[]> {
  const ids = rows.map((row) => row.appointment_id);
  const { data: reminders } = ids.length
    ? await supabase
        .from("sms_reminder")
        .select("appointment_id, delivery_status, scheduled_at, sent_at, next_attempt_at, status_reason")
        .eq("reminder_type", "UPCOMING")
        .in("appointment_id", ids)
        .order("reminder_id", { ascending: false })
    : { data: [] };
  const latest = new Map<number, NonNullable<typeof reminders>[number]>();
  for (const reminder of reminders ?? []) if (!latest.has(reminder.appointment_id)) latest.set(reminder.appointment_id, reminder);

  return rows.map((row) => {
    const mother = row.pregnancy?.mother;
    const reminder = latest.get(row.appointment_id);
    return {
      id: row.appointment_id,
      status: row.status,
      requestedAt: row.requested_datetime,
      scheduledAt: row.scheduled_datetime,
      at: row.scheduled_datetime ?? row.requested_datetime,
      remarks: row.remarks,
      createdAt: row.created_at,
      service: row.activity_type?.name ?? "",
      mother: {
        id: mother?.mother_id ?? 0,
        name: mother ? [mother.first_name, mother.middle_name, mother.last_name].filter(Boolean).join(" ") : "",
        contactNumber: mother?.contact_number ?? "",
        hasLogin: Boolean(mother?.user_id),
      },
      reminder: reminder
        ? {
            status: reminder.delivery_status,
            at: reminder.scheduled_at,
            sentAt: reminder.sent_at,
            retryAt: reminder.next_attempt_at,
            reason: reminder.status_reason,
          }
        : null,
    };
  });
}

/** PostgREST filter: the slot an appointment holds falls in [fromISO, toISO). */
export function slotInRange(fromISO: string, toISO: string): string {
  return `and(scheduled_datetime.gte.${fromISO},scheduled_datetime.lt.${toISO}),and(scheduled_datetime.is.null,requested_datetime.gte.${fromISO},requested_datetime.lt.${toISO})`;
}

/** Start of a Manila day as an instant. */
export const manilaDayStart = (date: string) => `${date}T00:00:00+08:00`;
