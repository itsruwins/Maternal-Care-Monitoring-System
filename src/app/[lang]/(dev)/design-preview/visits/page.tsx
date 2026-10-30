import { notFound } from "next/navigation";
import { VisitsView } from "@/features/visits/components/visits-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Visits preview", robots: { index: false } };

// Development only (preview): the staff Visits page with sample data.
export default async function VisitsPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <VisitsView
        t={t}
        locale={locale}
        today="2026-10-30"
        todays={[
          { id: 1, at: "2026-10-30T00:30:00Z", status: "COMPLETED", service: "Prenatal Checkup", mother: { id: 1, name: "Ana Marie Bautista" }, visitId: 7, dayVisitId: null },
          { id: 2, at: "2026-10-30T01:00:00Z", status: "CONFIRMED", service: "Tetanus Toxoid Vaccination", mother: { id: 2, name: "Carla Dela Cruz" }, visitId: null, dayVisitId: null },
          // Completed by the 6 PM check: done at her 8:30 checkup visit.
          { id: 4, at: "2026-10-30T01:30:00Z", status: "COMPLETED", service: "Tetanus Toxoid Vaccination", mother: { id: 1, name: "Ana Marie Bautista" }, visitId: null, dayVisitId: 7 },
          { id: 3, at: "2026-10-30T05:30:00Z", status: "CONFIRMED", service: "Nutrition Counseling", mother: { id: 3, name: "Grace Mendoza" }, visitId: null, dayVisitId: null },
        ]}
        recent={[
          { id: 7, at: "2026-10-30T00:41:00Z", weeks: 21, bp: "110/70", weightKg: 58.5, servicesCount: 2, mother: { id: 1, name: "Ana Marie Bautista" } },
          { id: 6, at: "2026-10-28T02:10:00Z", weeks: 34, bp: "120/80", weightKg: 64, servicesCount: 1, mother: { id: 5, name: "Liza Santos" } },
          { id: 5, at: "2026-10-27T06:05:00Z", weeks: 11, bp: "100/60", weightKg: 51.2, servicesCount: 0, mother: { id: 3, name: "Grace Mendoza" } },
        ]}
      />
    </StaffShell>
  );
}
