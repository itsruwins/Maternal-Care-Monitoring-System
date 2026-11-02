import { visitBuckets } from "@/features/reports/period";
import type { ReportFilters, ReportService, ReportSummary } from "@/features/reports/types";
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
