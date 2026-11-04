import { Suspense } from "react";
import { notFound } from "next/navigation";
import { VisitsView } from "@/features/visits/components/visits-screen";
import { countToday } from "@/features/visits/paths";
import { parseVisitFilters } from "@/features/visits/queries/visits";
import type { TodayAppointment, VisitRow } from "@/features/visits/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Visits preview", robots: { index: false } };

/** The preview's "today" (a Wednesday). */
const TODAY = "2026-11-04";

const TODAYS: TodayAppointment[] = [
  { id: 1, at: "2026-11-04T00:30:00Z", status: "COMPLETED", service: "Prenatal Checkup", mother: { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567" }, weeks: 21, visitId: 7, dayVisitId: null },
  // Completed by the 6 PM check: done at her 8:30 checkup visit.
  { id: 4, at: "2026-11-04T01:30:00Z", status: "COMPLETED", service: "Tetanus Toxoid Vaccination", mother: { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567" }, weeks: 21, visitId: null, dayVisitId: 7 },
  { id: 2, at: "2026-11-04T02:00:00Z", status: "CONFIRMED", service: "Tetanus Toxoid Vaccination", mother: { id: 2, name: "Carla Dela Cruz", contactNumber: "09181112222" }, weeks: 37, visitId: null, dayVisitId: null },
  { id: 5, at: "2026-11-04T03:00:00Z", status: "MISSED", service: "Iron / Folic Acid Supplementation", mother: { id: 6, name: "Rosalinda Macaraeg-Villanueva", contactNumber: "09223456789" }, weeks: 28, visitId: null, dayVisitId: null },
  { id: 3, at: "2026-11-04T05:30:00Z", status: "RESCHEDULED", service: "Nutrition Counseling", mother: { id: 3, name: "Grace Mendoza", contactNumber: "09193334444" }, weeks: 10, visitId: null, dayVisitId: null },
  { id: 6, at: "2026-11-04T07:00:00Z", status: "CONFIRMED", service: "Prenatal Checkup", mother: { id: 7, name: "Jennilyn Altura Dugan", contactNumber: "09167935761" }, weeks: null, visitId: null, dayVisitId: null },
];

const mother = (id: number, name: string, contactNumber: string) => ({ id, name, contactNumber });
const VISITS: VisitRow[] = [
  { id: 7, at: "2026-11-04T00:41:00Z", weeks: 21, bpSystolic: 110, bpDiastolic: 70, weightKg: 58.5, services: ["Prenatal Checkup", "Tetanus Toxoid Vaccination"], mother: mother(1, "Ana Marie Bautista", "09171234567") },
  { id: 6, at: "2026-11-03T06:20:00Z", weeks: 38, bpSystolic: 142, bpDiastolic: 92, weightKg: 71.3, services: ["Prenatal Checkup", "Blood Pressure Monitoring", "Birth Plan Counseling"], mother: mother(8, "Rosemarie Tarog Rodriguez", "09267629295") },
  { id: 5, at: "2026-11-03T02:10:00Z", weeks: 34, bpSystolic: 120, bpDiastolic: 80, weightKg: 64, services: ["Prenatal Checkup"], mother: mother(5, "Liza Santos", "09217778888") },
  { id: 4, at: "2026-11-03T01:05:00Z", weeks: 11, bpSystolic: 100, bpDiastolic: 60, weightKg: 51.2, services: [], mother: mother(3, "Grace Mendoza", "09193334444") },
  { id: 3, at: "2026-11-02T05:45:00Z", weeks: 26, bpSystolic: 130, bpDiastolic: 90, weightKg: 60.8, services: ["Iron / Folic Acid Supplementation"], mother: mother(9, "Maricel Ann Dimaculangan", "09359876543") },
  { id: 2, at: "2026-11-02T01:15:00Z", weeks: 17, bpSystolic: 118, bpDiastolic: 76, weightKg: 55.4, services: ["Prenatal Checkup", "Nutrition Counseling"], mother: mother(10, "Kristine Bañares", "09175550123") },
];

// Development only (preview): the staff Visits page with sample data. The
// filters change the address (the rows stay the sample); ?empty=1 shows the
// empty list, ?today=none no appointments today, ?page=2 the second page.
export default function VisitsPreview({ searchParams }: PageProps<"/[lang]/design-preview/visits">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/visits">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const filters = parseVisitFilters(params);
  const empty = params.empty === "1";
  const todays = params.today === "none" ? [] : TODAYS;
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <VisitsView
        t={t}
        locale={locale}
        today={TODAY}
        counts={{ ...countToday(todays), recordedToday: 1, week: 9 }}
        todays={todays}
        visits={empty ? { items: [], total: 0 } : { items: VISITS, total: 46 }}
        filters={filters}
      />
    </StaffShell>
  );
}
