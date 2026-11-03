import { visitBuckets } from "@/features/reports/period";
import type { ReportFilters, ReportRows, ReportService, ReportSummary } from "@/features/reports/types";
import type { PurokOption } from "@/lib/puroks/types";

// Sample figures for the Reports preview (no real records).

export const SAMPLE_TODAY_DATE = "2026-11-02";

export const SAMPLE_PUROKS: PurokOption[] = [
  { id: 1, name: "Purok 1" },
  { id: 2, name: "Purok 2" },
  { id: 3, name: "Purok 3" },
  { id: 4, name: "Purok 4" },
  { id: 5, name: "Purok 5" },
];

export const SAMPLE_SERVICES: ReportService[] = [
  { id: 1, name: "Prenatal check-up" },
  { id: 2, name: "Tetanus vaccine" },
  { id: 3, name: "Iron and folic acid" },
  { id: 4, name: "Blood and urine tests" },
  { id: 5, name: "Nutrition counselling" },
  { id: 6, name: "Dental check-up" },
];

const SERVICE_COUNTS = [41, 18, 33, 9, 12, 0];
const WEEK_COUNTS = [11, 14, 9, 13, 6, 4, 0, 2, 7, 12, 10, 8, 5, 9];
const MONTH_COUNTS = [38, 44, 31, 47, 40, 36, 52, 45, 39, 43, 41, 29];

export function sampleSummary(filters: ReportFilters, { admin, empty }: { admin: boolean; empty: boolean }): ReportSummary {
  const { grouping, ranges } = visitBuckets(filters.from, filters.to);
  const counts = grouping === "week" ? WEEK_COUNTS : MONTH_COUNTS;
  const buckets = ranges.map((range, index) => ({ ...range, count: empty ? 0 : counts[index % counts.length] }));
  const completed = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const n = (value: number) => (empty ? 0 : value);
  return {
    pregnancies: {
      active: n(64),
      added: n(9),
      closed: { LIVE_BIRTH: n(6), STILLBIRTH: 0, MISCARRIAGE: n(1), OTHER: 0 },
    },
    visits: { completed, mothers: n(Math.round(completed * 0.8)), walkIns: n(5), grouping, buckets },
    appointments: { REQUESTED: n(4), CONFIRMED: n(12), RESCHEDULED: n(2), COMPLETED: n(37), MISSED: n(3), CANCELLED: n(1) },
    services: SAMPLE_SERVICES.map((service, index) => ({ ...service, count: n(SERVICE_COUNTS[index]) })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    ),
    sms: admin ? { sent: n(58), delivered: n(51), failed: n(2), notSent: n(1), waiting: n(6) } : null,
  };
}

const MOTHERS = [
  { id: 1, name: "Ana Reyes Santos", purok: "Purok 1" },
  { id: 2, name: "Maricel Dela Peña Bautista", purok: "Purok 3" },
  { id: 3, name: "Joy Ann Villanueva", purok: null },
  { id: 4, name: "Kristine Mae Lopez Ocampo", purok: "Purok 2" },
  { id: 5, name: "Rhea Navarro", purok: "Purok 5" },
  { id: 6, name: "Liza Mendoza Cruz", purok: "Purok 4" },
];
const WORKERS = ["Joy Dela Cruz", "Maria Santos", null];

/** An instant in the period: day `n` (wrapping) at a morning hour, Manila time. */
function instant(filters: ReportFilters, n: number, hour: number): string {
  const start = new Date(`${filters.from}T00:00:00+08:00`).getTime();
  const end = new Date(`${filters.to}T00:00:00+08:00`).getTime();
  const days = Math.round((end - start) / 86_400_000) + 1;
  return new Date(start + ((n * 3) % days) * 86_400_000 + hour * 3_600_000).toISOString();
}

export function sampleRows(filters: ReportFilters, { admin, empty }: { admin: boolean; empty: boolean }): ReportRows | null {
  const count = empty ? 0 : 6;
  const n = Array.from({ length: count }, (_, i) => i);
  switch (filters.tab) {
    case "pregnancies":
      return {
        tab: "pregnancies",
        rows: n.map((i) => ({
          id: i + 1,
          mother: MOTHERS[i],
          registered: ["2026-03-14", "2026-05-02", "2026-06-20", "2026-07-08", "2026-11-01", "2026-04-11"][i],
          lmp: i === 3 ? null : ["2026-02-03", "2026-03-20", "2026-05-10", "2026-06-01", "2026-09-15", "2026-01-28"][i],
          due: i === 3 ? null : ["2026-11-10", "2026-12-25", "2027-02-14", "2027-03-08", "2027-06-22", "2026-11-04"][i],
          gravida: [2, 1, 3, 1, 4, 2][i],
          para: [1, 0, 2, 0, 3, 1][i],
          status: i === 5 ? ("DELIVERED" as const) : ("ACTIVE" as const),
          outcome: i === 5 ? ("LIVE_BIRTH" as const) : null,
          outcomeDate: i === 5 ? "2026-11-02" : null,
        }))
          // Like the real list: soonest due date first, none last.
          .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999")),
      };
    case "visits":
      return {
        tab: "visits",
        rows: n.map((i) => ({
          id: i + 1,
          at: instant(filters, i, 8 + (i % 4)),
          mother: MOTHERS[i],
          weeks: [38, 24, 12, 30, 7, 36][i],
          bp: ["110/70", "120/80", "100/60", "130/85", "110/70", "118/76"][i],
          weightKg: [61.5, 54, 48.2, 70.1, 52, 66.4][i],
          services: [["Prenatal check-up", "Iron and folic acid"], ["Prenatal check-up", "Tetanus vaccine", "Blood and urine tests"], ["Prenatal check-up"], [], ["Prenatal check-up", "Nutrition counselling"], ["Iron and folic acid"]][i],
          walkIn: i % 3 === 2,
          recordedBy: WORKERS[i % 3],
        })),
      };
    case "appointments": {
      const statuses = ["COMPLETED", "MISSED", "REQUESTED", "CONFIRMED", "MISSED", "CANCELLED"] as const;
      return {
        tab: "appointments",
        rows: n.map((i) => ({
          id: i + 1,
          at: instant(filters, i, 9 + (i % 3)),
          asked: statuses[i] === "REQUESTED",
          mother: MOTHERS[i],
          service: SAMPLE_SERVICES[i % 4].name,
          status: statuses[i],
          followUp:
            i === 1
              ? { open: true, attempts: 2, lastResult: "NOT_REACHED" as const, ending: null }
              : i === 4
                ? { open: false, attempts: 1, lastResult: "REACHED" as const, ending: { how: "REBOOKED" as const, at: null, closeReason: null, rebookedAt: instant(filters, 9, 9) } }
                : null,
        })),
      };
    }
    case "services":
      return {
        tab: "services",
        rows: n.map((i) => ({
          id: i + 1,
          at: instant(filters, i, 9),
          visitId: i + 1,
          mother: MOTHERS[i],
          service: SAMPLE_SERVICES[i % 5].name,
          details: ["Routine check", "TT2, 0.5 mL", "30 tablets", "", "Diet plan for anemia", "Routine check"][i],
          recordedBy: WORKERS[i % 3],
        })),
      };
    case "sms": {
      if (!admin) return null;
      const kinds = [
        { type: "UPCOMING", status: "DELIVERED", reason: null, retrying: false },
        { type: "MISSED_NOTICE", status: "SENT", reason: null, retrying: false },
        { type: "REQUEST_CONFIRMED", status: "FAILED", reason: "bad_number", retrying: false },
        { type: "VISIT_BOOKED", status: "DELIVERED", reason: null, retrying: false },
        { type: "VISIT_MOVED", status: "SKIPPED", reason: "visit_changed", retrying: false },
        { type: "UPCOMING", status: "PENDING", reason: "phone_offline", retrying: true },
      ] as const;
      return {
        tab: "sms",
        rows: n.map((i) => ({
          id: i + 1,
          type: kinds[i].type,
          status: kinds[i].status,
          reason: kinds[i].reason,
          number: "",
          text: "",
          at: instant(filters, i, 8),
          retrying: kinds[i].retrying,
          service: SAMPLE_SERVICES[i % 3].name,
          visitAt: instant(filters, i + 1, 9),
          mother: { id: MOTHERS[i].id, name: MOTHERS[i].name },
          purok: MOTHERS[i].purok,
        })),
      };
    }
    default:
      return null;
  }
}
