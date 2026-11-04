import "server-only";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { MyLastVisit, MyToday, MyVisit } from "../types";

// The logged-in mother's name, pregnancies and appointments, read with her own session
// (RLS: only her own records).
export async function getMyToday(user: CurrentUser): Promise<MyToday> {
  const supabase = await createClient();
  const { data: mother } = await supabase.from("mother").select("mother_id, first_name").eq("user_id", user.id).maybeSingle();
  if (!mother) return { firstName: user.username, current: null, past: [], visits: [], nextVisit: null, lastVisit: null };

  const { data: pregnancies } = await supabase
    .from("pregnancy")
    .select("pregnancy_id, pregnancy_status, lmp_date, expected_delivery_date, outcome, outcome_date, registration_date")
    .eq("mother_id", mother.mother_id);
  const rows = pregnancies ?? [];
  const active = rows.find((row) => row.pregnancy_status === "ACTIVE");

  // Her appointments (RLS: only her own), for the week strip and next visit,
  // and her latest checkup in the current pregnancy.
  const [{ data: appointments }, { data: latest }] = await Promise.all([
    rows.length
      ? supabase
          .from("appointment")
          .select("status, requested_datetime, scheduled_datetime, activity_type:activity_type_id(name)")
          .in("pregnancy_id", rows.map((row) => row.pregnancy_id))
          .neq("status", "CANCELLED")
      : Promise.resolve({ data: [] }),
    active
      ? supabase
          .from("prenatal_visit")
          .select("visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg")
          .eq("pregnancy_id", active.pregnancy_id)
          .order("visit_datetime", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const visits: MyVisit[] = (appointments ?? []).map((row) => ({
    at: row.scheduled_datetime ?? row.requested_datetime,
    service: row.activity_type?.name ?? "",
    status: row.status,
  }));
  const now = Date.now();
  const ahead = visits
    .filter((visit) => new Date(visit.at).getTime() > now && ["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(visit.status))
    .sort((a, b) => a.at.localeCompare(b.at));
  const nextVisit = ahead.find((visit) => visit.status === "CONFIRMED") ?? ahead[0] ?? null;

  const lastVisit: MyLastVisit | null = latest
    ? {
        at: latest.visit_datetime,
        weeks: latest.aog_weeks,
        bpSystolic: latest.bp_systolic,
        bpDiastolic: latest.bp_diastolic,
        weightKg: Number(latest.weight_kg),
      }
    : null;

  return {
    firstName: mother.first_name,
    visits,
    nextVisit,
    lastVisit,
    current: active ? { lmp: active.lmp_date, edd: active.expected_delivery_date } : null,
    past: rows
      .filter((row) => row.pregnancy_status !== "ACTIVE")
      .sort((a, b) => (b.outcome_date ?? b.registration_date).localeCompare(a.outcome_date ?? a.registration_date))
      .map((row) => ({ id: row.pregnancy_id, outcome: row.outcome, outcomeDate: row.outcome_date })),
  };
}
