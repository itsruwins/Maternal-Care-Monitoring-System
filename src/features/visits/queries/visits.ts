import "server-only";
import { toServiceIcon } from "@/lib/appointments/service-icons";
import { createClient } from "@/lib/supabase/server";
import { addDays, gestationalAge, PREGNANCY_DAYS } from "@/lib/utils/pregnancy";
import type { RecentVisit, TodayAppointment, VisitContext, VisitService, WalkInMother } from "../types";

// All read as the logged-in staff member (RLS: staff see every record).

const OPEN_STATUSES = ["CONFIRMED", "RESCHEDULED", "MISSED"] as const;
const dayStart = (date: string) => `${date}T00:00:00+08:00`;
const fullName = (m: { first_name: string; middle_name: string | null; last_name: string }) =>
  [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(" ");

/** Weeks pregnant on a day, from the LMP (or the due date minus 280 days). */
function weeksOn(p: { lmp_date: string | null; expected_delivery_date: string | null }, day: string): number | null {
  const lmp = p.lmp_date ?? (p.expected_delivery_date ? addDays(p.expected_delivery_date, -PREGNANCY_DAYS) : null);
  return lmp ? (gestationalAge(lmp, day)?.weeks ?? null) : null;
}

/** Appointments booked for today (open ones and those already recorded), by time. */
export async function listTodayAppointments(today: string): Promise<TodayAppointment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointment")
    .select(
      "appointment_id, status, scheduled_datetime, activity_type:activity_type_id(name), pregnancy:pregnancy_id(mother:mother_id(mother_id, first_name, middle_name, last_name))",
    )
    .in("status", [...OPEN_STATUSES, "COMPLETED"])
    .gte("scheduled_datetime", dayStart(today))
    .lt("scheduled_datetime", dayStart(addDays(today, 1)!))
    .order("scheduled_datetime");
  const rows = data ?? [];
  const ids = rows.map((row) => row.appointment_id);
  const { data: visits } = ids.length
    ? await supabase.from("prenatal_visit").select("visit_id, appointment_id").in("appointment_id", ids)
    : { data: [] };
  const visitOf = new Map((visits ?? []).map((v) => [v.appointment_id, v.visit_id]));
  return rows.map((row) => {
    const mother = row.pregnancy?.mother;
    return {
      id: row.appointment_id,
      at: row.scheduled_datetime!,
      status: row.status,
      service: row.activity_type?.name ?? "",
      mother: { id: mother?.mother_id ?? 0, name: mother ? fullName(mother) : "" },
      visitId: visitOf.get(row.appointment_id) ?? null,
    };
  });
}

/** The latest visits across all mothers. */
export async function listRecentVisits(limit = 20): Promise<RecentVisit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prenatal_visit")
    .select(
      "visit_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, visit_service(service_id), pregnancy:pregnancy_id(mother:mother_id(mother_id, first_name, middle_name, last_name))",
    )
    .order("visit_datetime", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => {
    const mother = row.pregnancy?.mother;
    return {
      id: row.visit_id,
      at: row.visit_datetime,
      weeks: row.aog_weeks,
      bp: `${row.bp_systolic}/${row.bp_diastolic}`,
      weightKg: Number(row.weight_kg),
      servicesCount: row.visit_service.length,
      mother: { id: mother?.mother_id ?? 0, name: mother ? fullName(mother) : "" },
    };
  });
}

export async function listVisitServices(): Promise<VisitService[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("activity_type").select("activity_type_id, name, icon").order("activity_type_id");
  return (data ?? []).map((row) => ({ id: row.activity_type_id, name: row.name, icon: toServiceIcon(row.icon) }));
}

/**
 * The form's context: from an appointment (?appointment=ID), or a mother
 * (?mother=ID, a walk-in; her open appointment today is linked if she has one).
 */
export async function getVisitContext(by: { appointmentId?: number; motherId?: number }, today: string): Promise<VisitContext | null> {
  const supabase = await createClient();
  let motherId = by.motherId ?? null;
  let appointment: VisitContext["appointment"] = null;

  if (by.appointmentId) {
    const { data } = await supabase
      .from("appointment")
      .select("appointment_id, status, scheduled_datetime, activity_type_id, activity_type:activity_type_id(name), pregnancy:pregnancy_id(mother_id)")
      .eq("appointment_id", by.appointmentId)
      .maybeSingle();
    if (!data || !data.scheduled_datetime || !(OPEN_STATUSES as readonly string[]).includes(data.status)) return null;
    motherId = data.pregnancy?.mother_id ?? null;
    appointment = { id: data.appointment_id, at: data.scheduled_datetime, serviceId: data.activity_type_id, service: data.activity_type?.name ?? "" };
  }
  if (!motherId) return null;

  const { data: mother } = await supabase
    .from("mother")
    .select("mother_id, first_name, middle_name, last_name, contact_number, pregnancy!inner(pregnancy_id, pregnancy_status, lmp_date, expected_delivery_date)")
    .eq("mother_id", motherId)
    .eq("pregnancy.pregnancy_status", "ACTIVE")
    .maybeSingle();
  if (!mother) return null;
  const pregnancy = mother.pregnancy[0];

  // A walk-in who has an open appointment today: link it.
  if (!appointment) {
    const { data: todays } = await supabase
      .from("appointment")
      .select("appointment_id, scheduled_datetime, activity_type_id, activity_type:activity_type_id(name)")
      .eq("pregnancy_id", pregnancy.pregnancy_id)
      .in("status", [...OPEN_STATUSES])
      .gte("scheduled_datetime", dayStart(today))
      .lt("scheduled_datetime", dayStart(addDays(today, 1)!))
      .order("scheduled_datetime")
      .limit(1);
    const first = todays?.[0];
    if (first?.scheduled_datetime) {
      appointment = { id: first.appointment_id, at: first.scheduled_datetime, serviceId: first.activity_type_id, service: first.activity_type?.name ?? "" };
    }
  }

  const { data: last } = await supabase
    .from("prenatal_visit")
    .select("weight_kg")
    .eq("pregnancy_id", pregnancy.pregnancy_id)
    .order("visit_datetime", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    mother: { id: mother.mother_id, name: fullName(mother), contactNumber: mother.contact_number },
    pregnancyId: pregnancy.pregnancy_id,
    weeks: weeksOn(pregnancy, today),
    lastWeightKg: last ? Number(last.weight_kg) : null,
    appointment,
  };
}

/** Mothers with a current pregnancy matching a search (walk-ins). */
export async function findWalkInMothers(q: string, today: string): Promise<WalkInMother[]> {
  const supabase = await createClient();
  let query = supabase
    .from("mother")
    .select("mother_id, first_name, middle_name, last_name, contact_number, pregnancy!inner(pregnancy_status, lmp_date, expected_delivery_date)")
    .eq("pregnancy.pregnancy_status", "ACTIVE")
    .order("last_name")
    .order("first_name")
    .limit(10);
  // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
  const clean = q.replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60);
  for (const word of clean.split(" ").filter(Boolean)) {
    const like = `%${word}%`;
    query = query.or(`first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},contact_number.ilike.${like}`);
  }
  const { data } = await query;
  return (data ?? []).map((row) => ({
    id: row.mother_id,
    name: fullName(row),
    contactNumber: row.contact_number,
    weeks: weeksOn(row.pregnancy[0], today),
  }));
}

/** A saved visit, for the "Book next checkup" step. */
export async function getSavedVisit(visitId: number): Promise<{ motherId: number; name: string; weeks: number; date: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prenatal_visit")
    .select("visit_id, visit_datetime, aog_weeks, pregnancy:pregnancy_id(mother:mother_id(mother_id, first_name, middle_name, last_name))")
    .eq("visit_id", visitId)
    .maybeSingle();
  const mother = data?.pregnancy?.mother;
  if (!data || !mother) return null;
  return { motherId: mother.mother_id, name: fullName(mother), weeks: data.aog_weeks, date: data.visit_datetime };
}
