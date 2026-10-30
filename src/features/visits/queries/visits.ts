import "server-only";
import { toServiceIcon } from "@/lib/appointments/service-icons";
import { createClient } from "@/lib/supabase/server";
import { addDays, gestationalAge, PREGNANCY_DAYS } from "@/lib/utils/pregnancy";
import type { MotherVisit, RecentVisit, TodayAppointment, VisitContext, VisitDetail, VisitService, WalkInMother } from "../types";

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
      "appointment_id, pregnancy_id, status, scheduled_datetime, activity_type:activity_type_id(name), pregnancy:pregnancy_id(mother:mother_id(mother_id, first_name, middle_name, last_name))",
    )
    .in("status", [...OPEN_STATUSES, "COMPLETED"])
    .gte("scheduled_datetime", dayStart(today))
    .lt("scheduled_datetime", dayStart(addDays(today, 1)!))
    .order("scheduled_datetime");
  const rows = data ?? [];
  const ids = rows.map((row) => row.appointment_id);
  // The 6 PM check marks her other appointments that day Completed without
  // linking them to her visit, so those point to the visit she had today.
  const done = [...new Set(rows.filter((row) => row.status === "COMPLETED").map((row) => row.pregnancy_id))];
  const [{ data: visits }, { data: dayVisits }] = await Promise.all([
    ids.length ? supabase.from("prenatal_visit").select("visit_id, appointment_id").in("appointment_id", ids) : { data: [] },
    done.length
      ? supabase
          .from("prenatal_visit")
          .select("visit_id, pregnancy_id")
          .in("pregnancy_id", done)
          .gte("visit_datetime", dayStart(today))
          .lt("visit_datetime", dayStart(addDays(today, 1)!))
          .order("visit_datetime")
      : { data: [] },
  ]);
  const visitOf = new Map((visits ?? []).map((v) => [v.appointment_id, v.visit_id]));
  const dayVisitOf = new Map<number, number>();
  for (const v of dayVisits ?? []) if (!dayVisitOf.has(v.pregnancy_id)) dayVisitOf.set(v.pregnancy_id, v.visit_id);
  return rows.map((row) => {
    const mother = row.pregnancy?.mother;
    return {
      id: row.appointment_id,
      at: row.scheduled_datetime!,
      status: row.status,
      service: row.activity_type?.name ?? "",
      mother: { id: mother?.mother_id ?? 0, name: mother ? fullName(mother) : "" },
      visitId: visitOf.get(row.appointment_id) ?? null,
      dayVisitId: row.status === "COMPLETED" ? (dayVisitOf.get(row.pregnancy_id) ?? null) : null,
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

const VISIT_COLUMNS =
  "visit_id, pregnancy_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse_rate, fundal_height_cm, fetal_heart_rate, notes, appointment_id, recorder:health_worker_id(first_name, last_name), pregnancy:pregnancy_id(pregnancy_status, mother:mother_id(mother_id, first_name, middle_name, last_name)), visit_service(activity_type_id, dose_or_details, result_notes, activity_type:activity_type_id(name, icon))";

/** Manila date of an instant. */
const manilaDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

/** One visit with everything the details page shows. */
export async function getVisit(visitId: number, viewer: { isAdmin: boolean; today: string }): Promise<VisitDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("prenatal_visit").select(VISIT_COLUMNS).eq("visit_id", visitId).maybeSingle();
  const mother = data?.pregnancy?.mother;
  if (!data || !mother) return null;

  const [{ data: appointment }, { data: previous }] = await Promise.all([
    data.appointment_id
      ? supabase.from("appointment").select("scheduled_datetime, activity_type:activity_type_id(name)").eq("appointment_id", data.appointment_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("prenatal_visit")
      .select("weight_kg")
      .eq("pregnancy_id", data.pregnancy_id)
      .lt("visit_datetime", data.visit_datetime)
      .order("visit_datetime", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    id: data.visit_id,
    at: data.visit_datetime,
    weeks: data.aog_weeks,
    pregnancyId: data.pregnancy_id,
    pregnancyActive: data.pregnancy?.pregnancy_status === "ACTIVE",
    mother: { id: mother.mother_id, name: fullName(mother) },
    recordedBy: data.recorder ? `${data.recorder.first_name} ${data.recorder.last_name}`.trim() : null,
    appointment: appointment?.scheduled_datetime ? { service: appointment.activity_type?.name ?? "", at: appointment.scheduled_datetime } : null,
    vitals: {
      bpSystolic: data.bp_systolic,
      bpDiastolic: data.bp_diastolic,
      weightKg: Number(data.weight_kg),
      temperatureC: Number(data.temperature_c),
      pulseRate: data.pulse_rate,
      fundalHeightCm: data.fundal_height_cm === null ? null : Number(data.fundal_height_cm),
      fetalHeartRate: data.fetal_heart_rate,
    },
    notes: data.notes,
    services: data.visit_service.map((s) => ({
      serviceId: s.activity_type_id,
      name: s.activity_type?.name ?? "",
      icon: toServiceIcon(s.activity_type?.icon),
      details: s.dose_or_details,
      resultNotes: s.result_notes,
    })),
    editable: viewer.isAdmin || manilaDate(data.visit_datetime) === viewer.today,
    previousWeightKg: previous ? Number(previous.weight_kg) : null,
  };
}

/** All her visits (every pregnancy), newest first. */
export async function listMotherVisits(motherId: number): Promise<MotherVisit[]> {
  const supabase = await createClient();
  const { data: pregnancies } = await supabase.from("pregnancy").select("pregnancy_id, pregnancy_status").eq("mother_id", motherId);
  const ids = (pregnancies ?? []).map((p) => p.pregnancy_id);
  if (!ids.length) return [];
  const active = new Set((pregnancies ?? []).filter((p) => p.pregnancy_status === "ACTIVE").map((p) => p.pregnancy_id));
  const { data } = await supabase
    .from("prenatal_visit")
    .select("visit_id, pregnancy_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, visit_service(activity_type:activity_type_id(name))")
    .in("pregnancy_id", ids)
    .order("visit_datetime", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.visit_id,
    at: row.visit_datetime,
    weeks: row.aog_weeks,
    bp: `${row.bp_systolic}/${row.bp_diastolic}`,
    weightKg: Number(row.weight_kg),
    services: row.visit_service.map((s) => s.activity_type?.name ?? "").filter(Boolean),
    currentPregnancy: active.has(row.pregnancy_id),
  }));
}
