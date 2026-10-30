import "server-only";
import { toServiceIcon } from "@/lib/appointments/service-icons";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { MyVisitDetail, MyVisits } from "../types";

// The mother's own visits and next visit, read with her own session (RLS:
// only her records). Staff visit notes are for staff and are not shown.

async function myPregnancies(user: CurrentUser) {
  const supabase = await createClient();
  const { data: mother } = await supabase.from("mother").select("mother_id").eq("user_id", user.id).maybeSingle();
  if (!mother) return { supabase, pregnancies: [] as { pregnancy_id: number; pregnancy_status: string }[] };
  const { data } = await supabase.from("pregnancy").select("pregnancy_id, pregnancy_status").eq("mother_id", mother.mother_id);
  return { supabase, pregnancies: data ?? [] };
}

export async function getMyVisits(user: CurrentUser): Promise<MyVisits> {
  const { supabase, pregnancies } = await myPregnancies(user);
  const ids = pregnancies.map((p) => p.pregnancy_id);
  const active = new Set(pregnancies.filter((p) => p.pregnancy_status === "ACTIVE").map((p) => p.pregnancy_id));
  if (!ids.length) return { hasCurrentPregnancy: false, next: null, visits: [] };

  const [{ data: visits }, { data: upcoming }] = await Promise.all([
    supabase
      .from("prenatal_visit")
      .select("visit_id, pregnancy_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, visit_service(activity_type:activity_type_id(name))")
      .in("pregnancy_id", ids)
      .order("visit_datetime", { ascending: false }),
    supabase
      .from("appointment")
      .select("status, requested_datetime, scheduled_datetime, activity_type:activity_type_id(name)")
      .in("pregnancy_id", ids)
      .in("status", ["REQUESTED", "CONFIRMED", "RESCHEDULED"]),
  ]);

  const now = new Date().toISOString();
  const ahead = (upcoming ?? [])
    .map((row) => ({ at: row.scheduled_datetime ?? row.requested_datetime, service: row.activity_type?.name ?? "", status: row.status }))
    .filter((row) => row.at > now)
    .sort((a, b) => a.at.localeCompare(b.at));

  return {
    hasCurrentPregnancy: active.size > 0,
    next: ahead.find((row) => row.status === "CONFIRMED") ?? ahead[0] ?? null,
    visits: (visits ?? []).map((row) => ({
      id: row.visit_id,
      at: row.visit_datetime,
      weeks: row.aog_weeks,
      bpSystolic: row.bp_systolic,
      bpDiastolic: row.bp_diastolic,
      weightKg: Number(row.weight_kg),
      services: row.visit_service.map((s) => s.activity_type?.name ?? "").filter(Boolean),
      currentPregnancy: active.has(row.pregnancy_id),
    })),
  };
}

export async function getMyVisit(user: CurrentUser, visitId: number): Promise<MyVisitDetail | null> {
  const { supabase, pregnancies } = await myPregnancies(user);
  const ids = pregnancies.map((p) => p.pregnancy_id);
  if (!ids.length) return null;
  const { data } = await supabase
    .from("prenatal_visit")
    .select(
      "visit_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, temperature_c, pulse_rate, fundal_height_cm, fetal_heart_rate, visit_service(dose_or_details, result_notes, activity_type:activity_type_id(name, icon))",
    )
    .eq("visit_id", visitId)
    .in("pregnancy_id", ids)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.visit_id,
    at: data.visit_datetime,
    weeks: data.aog_weeks,
    vitals: {
      bpSystolic: data.bp_systolic,
      bpDiastolic: data.bp_diastolic,
      weightKg: Number(data.weight_kg),
      temperatureC: Number(data.temperature_c),
      pulseRate: data.pulse_rate,
      fundalHeightCm: data.fundal_height_cm === null ? null : Number(data.fundal_height_cm),
      fetalHeartRate: data.fetal_heart_rate,
    },
    services: data.visit_service.map((s) => ({
      name: s.activity_type?.name ?? "",
      icon: toServiceIcon(s.activity_type?.icon),
      details: s.dose_or_details,
      resultNotes: s.result_notes,
    })),
  };
}
