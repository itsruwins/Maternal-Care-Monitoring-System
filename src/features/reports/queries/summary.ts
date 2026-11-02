import "server-only";
import { createClient } from "@/lib/supabase/server";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import type { AppointmentStatus, PregnancyOutcome } from "@/types/database";
import { visitBuckets } from "../period";
import type { ReportFilters, ReportService, ReportSummary } from "../types";
import { byPurok, countOf, periodInstants, readAll } from "./read-all";

// All read as the logged-in staff member (RLS: staff see every record; only
// admins get the SMS part, checked by the caller too).

const OUTCOMES: PregnancyOutcome[] = ["LIVE_BIRTH", "STILLBIRTH", "MISCARRIAGE", "OTHER"];
const STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];

/** Every service (activity type), by name: the service filter and the Services figures. */
export async function listReportServices(): Promise<ReportService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("activity_type").select("activity_type_id, name").order("name");
  if (error) throw new Error("Report read failed", { cause: error });
  return (data ?? []).map((row) => ({ id: row.activity_type_id, name: row.name }));
}

/** The Summary tab: every figure for the period and purok. */
export async function getReportSummary(filters: ReportFilters, viewer: { isAdmin: boolean }, services: ReportService[]): Promise<ReportSummary> {
  const supabase = await createClient();
  const { from, to, purok } = filters;
  const { startAt, endAt } = periodInstants(filters);
  const inPeriod = `and(scheduled_datetime.gte.${startAt},scheduled_datetime.lt.${endAt}),and(scheduled_datetime.is.null,requested_datetime.gte.${startAt},requested_datetime.lt.${endAt})`;

  const [active, added, closedRows, visitRows, appointmentRows, serviceRows, sms] = await Promise.all([
    // Registered by the period's end and not closed before it started.
    countOf(
      byPurok(
        supabase
          .from("pregnancy")
          .select("pregnancy_id, mother!inner(purok_id)", { count: "exact", head: true })
          .lte("registration_date", to)
          .or(`pregnancy_status.eq.ACTIVE,outcome_date.gte.${from}`),
        "mother.purok_id",
        purok,
      ),
    ),
    countOf(
      byPurok(
        supabase
          .from("pregnancy")
          .select("pregnancy_id, mother!inner(purok_id)", { count: "exact", head: true })
          .gte("registration_date", from)
          .lte("registration_date", to),
        "mother.purok_id",
        purok,
      ),
    ),
    readAll((a, b) =>
      byPurok(
        supabase
          .from("pregnancy")
          .select("pregnancy_id, outcome, mother!inner(purok_id)")
          .neq("pregnancy_status", "ACTIVE")
          .gte("outcome_date", from)
          .lte("outcome_date", to),
        "mother.purok_id",
        purok,
      )
        .order("pregnancy_id")
        .range(a, b),
    ),
    readAll((a, b) =>
      byPurok(
        supabase
          .from("prenatal_visit")
          .select("visit_id, visit_datetime, appointment_id, pregnancy!inner(mother_id, mother!inner(purok_id))")
          .gte("visit_datetime", startAt)
          .lt("visit_datetime", endAt),
        "pregnancy.mother.purok_id",
        purok,
      )
        .order("visit_id")
        .range(a, b),
    ),
    // An appointment's time: its scheduled time, or the time she asked for while it has none.
    readAll((a, b) =>
      byPurok(
        supabase.from("appointment").select("appointment_id, status, pregnancy!inner(mother!inner(purok_id))").or(inPeriod),
        "pregnancy.mother.purok_id",
        purok,
      )
        .order("appointment_id")
        .range(a, b),
    ),
    readAll((a, b) =>
      byPurok(
        supabase
          .from("visit_service")
          .select("service_id, activity_type_id, prenatal_visit!inner(visit_datetime, pregnancy!inner(mother!inner(purok_id)))")
          .gte("prenatal_visit.visit_datetime", startAt)
          .lt("prenatal_visit.visit_datetime", endAt),
        "prenatal_visit.pregnancy.mother.purok_id",
        purok,
      )
        .order("service_id")
        .range(a, b),
    ),
    viewer.isAdmin ? smsFigures(filters, startAt, endAt) : Promise.resolve(null),
  ]);

  const closed = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, 0])) as Record<PregnancyOutcome, number>;
  for (const row of closedRows) if (row.outcome) closed[row.outcome] += 1;

  const { grouping, ranges } = visitBuckets(from, to);
  const buckets = ranges.map((range) => ({ ...range, count: 0 }));
  for (const row of visitRows) {
    const day = manilaTodayISO(new Date(row.visit_datetime));
    const bucket = buckets.find((b) => b.start <= day && day <= b.end);
    if (bucket) bucket.count += 1;
  }

  const appointments = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<AppointmentStatus, number>;
  for (const row of appointmentRows) appointments[row.status] += 1;

  const given = new Map<number, number>();
  for (const row of serviceRows) given.set(row.activity_type_id, (given.get(row.activity_type_id) ?? 0) + 1);

  return {
    pregnancies: { active, added, closed },
    visits: {
      completed: visitRows.length,
      mothers: new Set(visitRows.map((row) => row.pregnancy.mother_id)).size,
      walkIns: visitRows.filter((row) => row.appointment_id === null).length,
      grouping,
      buckets,
    },
    appointments,
    services: services
      .map((service) => ({ ...service, count: given.get(service.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    sms,
  };
}

/** Texts in the period by status, dated as the SMS log dates them (when sent, else when due). */
async function smsFigures(filters: ReportFilters, startAt: string, endAt: string): Promise<NonNullable<ReportSummary["sms"]>> {
  const supabase = await createClient();
  // The SMS log view has no purok: narrow it by her mother id instead.
  let motherIds: number[] | null = null;
  if (filters.purok !== "") {
    const mothers = await readAll((a, b) =>
      byPurok(supabase.from("mother").select("mother_id"), "purok_id", filters.purok)
        .order("mother_id")
        .range(a, b),
    );
    motherIds = mothers.map((row) => row.mother_id);
  }
  const figures = { sent: 0, delivered: 0, failed: 0, notSent: 0, waiting: 0 };
  if (motherIds && motherIds.length === 0) return figures;

  const rows = await readAll((a, b) => {
    let query = supabase
      .from("sms_log_item")
      .select("reminder_id, delivery_status")
      .gte("shown_at", startAt)
      .lt("shown_at", endAt);
    if (motherIds) query = query.in("mother_id", motherIds);
    return query.order("reminder_id").range(a, b);
  });
  for (const row of rows) {
    if (row.delivery_status === "SENT") figures.sent += 1;
    else if (row.delivery_status === "DELIVERED") {
      figures.sent += 1;
      figures.delivered += 1;
    } else if (row.delivery_status === "FAILED") figures.failed += 1;
    else if (row.delivery_status === "SKIPPED") figures.notSent += 1;
    else figures.waiting += 1;
  }
  return figures;
}
