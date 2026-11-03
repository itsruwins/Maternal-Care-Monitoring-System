import "server-only";
import type { SmsStatusReason } from "@/features/sms/types";
import { createClient } from "@/lib/supabase/server";
import type { FollowUpItemRow, ReminderType, SmsDeliveryStatus } from "@/types/database";
import type {
  AppointmentReportRow,
  PregnancyReportRow,
  ReportFilters,
  ReportMother,
  ReportRows,
  ServiceReportRow,
  SmsReportRow,
  SmsStatusFilter,
  SmsTypeFilter,
  VisitReportRow,
} from "../types";
import { byPurok, periodInstants, readAll } from "./read-all";

// The detail tabs: every row for the period (no paging, so printing and the
// CSV carry everything), oldest first. All read as the logged-in staff member
// (RLS: staff see every record; the SMS tab is for admins, checked by the
// caller too). The same rules as the Summary, so the counts match.

const MOTHER = "mother_id, first_name, middle_name, last_name, purok:purok_id(name)";

type MotherFields = { mother_id: number; first_name: string; middle_name: string | null; last_name: string; purok: { name: string } | null };
const toMother = (m: MotherFields): ReportMother => ({
  id: m.mother_id,
  name: [m.first_name, m.middle_name, m.last_name].filter(Boolean).join(" "),
  purok: m.purok?.name ?? null,
});
const workerName = (w: { first_name: string; last_name: string } | null) => (w ? `${w.first_name} ${w.last_name}`.trim() : null);

const SMS_STATUSES: Record<SmsStatusFilter, SmsDeliveryStatus[]> = {
  waiting: ["PENDING"],
  sent: ["SENT", "DELIVERED"],
  delivered: ["DELIVERED"],
  failed: ["FAILED"],
  skipped: ["SKIPPED"],
};
const SMS_TYPES: Record<SmsTypeFilter, ReminderType[]> = {
  reminder: ["UPCOMING"],
  missed: ["MISSED_NOTICE"],
  answer: ["REQUEST_CONFIRMED", "REQUEST_NEW_TIME", "REQUEST_DECLINED", "VISIT_BOOKED", "VISIT_MOVED", "VISIT_CANCELLED"],
};

/** The rows of the filters' detail tab (null on the Summary). */
export async function getReportRows(filters: ReportFilters, viewer: { isAdmin: boolean }): Promise<ReportRows | null> {
  switch (filters.tab) {
    case "pregnancies":
      return { tab: "pregnancies", rows: await listPregnancies(filters) };
    case "visits":
      return { tab: "visits", rows: await listVisits(filters) };
    case "appointments":
      return { tab: "appointments", rows: await listAppointments(filters) };
    case "services":
      return { tab: "services", rows: await listServices(filters) };
    case "sms":
      return viewer.isAdmin ? { tab: "sms", rows: await listSms(filters) } : null;
    default:
      return null;
  }
}

/** Pregnancies active at any time in the period (or the chosen part of them), soonest due date first. */
async function listPregnancies(filters: ReportFilters): Promise<PregnancyReportRow[]> {
  const supabase = await createClient();
  const { from, to, purok, show } = filters;
  const rows = await readAll((a, b) => {
    let query = supabase
      .from("pregnancy")
      .select(
        `pregnancy_id, registration_date, lmp_date, expected_delivery_date, gravida, para, pregnancy_status, outcome, outcome_date, mother!inner(${MOTHER})`,
      )
      .lte("registration_date", to)
      .or(`pregnancy_status.eq.ACTIVE,outcome_date.gte.${from}`);
    if (show === "still") query = query.or(`outcome_date.is.null,outcome_date.gt.${to}`);
    if (show === "added") query = query.gte("registration_date", from);
    if (show === "closed") query = query.neq("pregnancy_status", "ACTIVE").gte("outcome_date", from).lte("outcome_date", to);
    return byPurok(query, "mother.purok_id", purok)
      .order("expected_delivery_date", { ascending: true, nullsFirst: false })
      .order("pregnancy_id")
      .range(a, b);
  });
  return rows.map((row) => ({
    id: row.pregnancy_id,
    mother: toMother(row.mother),
    registered: row.registration_date,
    lmp: row.lmp_date,
    due: row.expected_delivery_date,
    gravida: row.gravida,
    para: row.para,
    status: row.pregnancy_status,
    outcome: row.outcome,
    outcomeDate: row.outcome_date,
  }));
}

/** Completed visits in the period (those that included the chosen service), oldest first. */
async function listVisits(filters: ReportFilters): Promise<VisitReportRow[]> {
  const supabase = await createClient();
  const { startAt, endAt } = periodInstants(filters);
  const rows = await readAll((a, b) =>
    byPurok(
      supabase
        .from("prenatal_visit")
        .select(
          `visit_id, visit_datetime, aog_weeks, bp_systolic, bp_diastolic, weight_kg, appointment_id, recorder:health_worker_id(first_name, last_name), pregnancy!inner(mother!inner(${MOTHER})), visit_service(service_id, activity_type_id, activity_type:activity_type_id(name))`,
        )
        .gte("visit_datetime", startAt)
        .lt("visit_datetime", endAt),
      "pregnancy.mother.purok_id",
      filters.purok,
    )
      .order("visit_datetime")
      .order("visit_id")
      .range(a, b),
  );
  return rows
    .filter((row) => filters.service === "" || row.visit_service.some((given) => given.activity_type_id === filters.service))
    .map((row) => ({
      id: row.visit_id,
      at: row.visit_datetime,
      mother: toMother(row.pregnancy.mother),
      weeks: row.aog_weeks,
      bp: `${row.bp_systolic}/${row.bp_diastolic}`,
      weightKg: Number(row.weight_kg),
      services: [...row.visit_service].sort((x, y) => x.service_id - y.service_id).map((given) => given.activity_type?.name ?? ""),
      walkIn: row.appointment_id === null,
      recordedBy: workerName(row.recorder),
    }));
}

/** Appointments whose time (or asked time, while a request) is in the period, oldest first; a missed one with its follow-up. */
async function listAppointments(filters: ReportFilters): Promise<AppointmentReportRow[]> {
  const supabase = await createClient();
  const { startAt, endAt } = periodInstants(filters);
  const inPeriod = `and(scheduled_datetime.gte.${startAt},scheduled_datetime.lt.${endAt}),and(scheduled_datetime.is.null,requested_datetime.gte.${startAt},requested_datetime.lt.${endAt})`;
  const rows = await readAll((a, b) => {
    let query = supabase
      .from("appointment")
      .select(`appointment_id, requested_datetime, scheduled_datetime, status, activity_type:activity_type_id(name), pregnancy!inner(mother!inner(${MOTHER}))`)
      .or(inPeriod);
    if (filters.status) query = query.eq("status", filters.status as AppointmentReportRow["status"]);
    if (filters.service !== "") query = query.eq("activity_type_id", filters.service);
    return byPurok(query, "pregnancy.mother.purok_id", filters.purok).order("appointment_id").range(a, b);
  });

  const missed = rows.filter((row) => row.status === "MISSED").map((row) => row.appointment_id);
  const followUps = new Map<number, Pick<FollowUpItemRow, "appointment_id" | "is_open" | "attempts" | "last_result" | "ended_how" | "ended_at" | "close_reason" | "rebooked_at">>();
  for (let i = 0; i < missed.length; i += 200) {
    const { data, error } = await supabase
      .from("follow_up_item")
      .select("appointment_id, is_open, attempts, last_result, ended_how, ended_at, close_reason, rebooked_at")
      .in("appointment_id", missed.slice(i, i + 200));
    if (error) throw new Error("Report read failed", { cause: error });
    for (const item of data ?? []) followUps.set(item.appointment_id, item);
  }

  return rows
    .map((row): AppointmentReportRow => {
      const item = followUps.get(row.appointment_id);
      return {
        id: row.appointment_id,
        at: row.scheduled_datetime ?? row.requested_datetime,
        asked: row.scheduled_datetime === null,
        mother: toMother(row.pregnancy.mother),
        service: row.activity_type?.name ?? "",
        status: row.status,
        followUp: item
          ? {
              open: item.is_open,
              attempts: item.attempts,
              lastResult: item.last_result,
              ending: item.ended_how ? { how: item.ended_how, at: item.ended_at, closeReason: item.close_reason, rebookedAt: item.rebooked_at } : null,
            }
          : null,
      };
    })
    .sort((x, y) => x.at.localeCompare(y.at) || x.id - y.id);
}

/** Each service given at the period's visits (or only the chosen service), oldest first. */
async function listServices(filters: ReportFilters): Promise<ServiceReportRow[]> {
  const supabase = await createClient();
  const { startAt, endAt } = periodInstants(filters);
  const rows = await readAll((a, b) => {
    let query = supabase
      .from("visit_service")
      .select(
        `service_id, dose_or_details, activity_type:activity_type_id(name), prenatal_visit!inner(visit_id, visit_datetime, recorder:health_worker_id(first_name, last_name), pregnancy!inner(mother!inner(${MOTHER})))`,
      )
      .gte("prenatal_visit.visit_datetime", startAt)
      .lt("prenatal_visit.visit_datetime", endAt);
    if (filters.service !== "") query = query.eq("activity_type_id", filters.service);
    return byPurok(query, "prenatal_visit.pregnancy.mother.purok_id", filters.purok).order("service_id").range(a, b);
  });
  return rows
    .map((row) => ({
      id: row.service_id,
      at: row.prenatal_visit.visit_datetime,
      visitId: row.prenatal_visit.visit_id,
      mother: toMother(row.prenatal_visit.pregnancy.mother),
      service: row.activity_type?.name ?? "",
      details: row.dose_or_details,
      recordedBy: workerName(row.prenatal_visit.recorder),
    }))
    .sort((x, y) => x.at.localeCompare(y.at) || x.id - y.id);
}

/** Texts dated in the period (when they went out, or were due), oldest first. The view has no purok, so it's matched here. */
async function listSms(filters: ReportFilters): Promise<SmsReportRow[]> {
  const supabase = await createClient();
  const { startAt, endAt } = periodInstants(filters);
  const [rows, mothers] = await Promise.all([
    readAll((a, b) => {
      let query = supabase
        .from("sms_log_item")
        .select(
          "reminder_id, reminder_type, delivery_status, status_reason, message_text, shown_at, next_attempt_at, service, visit_at, mother_id, first_name, middle_name, last_name",
        )
        .gte("shown_at", startAt)
        .lt("shown_at", endAt);
      if (filters.status) query = query.in("delivery_status", SMS_STATUSES[filters.status as SmsStatusFilter]);
      if (filters.type) query = query.in("reminder_type", SMS_TYPES[filters.type]);
      return query.order("shown_at").order("reminder_id").range(a, b);
    }),
    readAll((a, b) => supabase.from("mother").select("mother_id, purok_id, purok:purok_id(name)").order("mother_id").range(a, b)),
  ]);
  const purokOf = new Map(mothers.map((m) => [m.mother_id, m]));
  const inPurok = (motherId: number) => {
    const purokId = purokOf.get(motherId)?.purok_id ?? null;
    return filters.purok === "" || (filters.purok === "none" ? purokId === null : purokId === filters.purok);
  };
  return rows
    .filter((row) => inPurok(row.mother_id))
    .map((row) => {
      return {
        id: row.reminder_id,
        type: row.reminder_type,
        status: row.delivery_status,
        reason: row.status_reason as SmsStatusReason | null,
        // Reports never show or export phone numbers.
        number: "",
        text: row.message_text,
        at: row.shown_at,
        retrying: row.delivery_status === "PENDING" && row.next_attempt_at !== null,
        service: row.service,
        visitAt: row.visit_at,
        mother: { id: row.mother_id, name: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ") },
        purok: purokOf.get(row.mother_id)?.purok?.name ?? null,
      };
    });
}
