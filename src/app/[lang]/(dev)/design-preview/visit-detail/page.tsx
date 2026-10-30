import { notFound } from "next/navigation";
import { VisitDetailView } from "@/features/visits/components/visit-detail-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Visit details preview", robots: { index: false } };

// Development only (preview): one visit with sample data.
export default async function VisitDetailPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <VisitDetailView
        t={t}
        locale={locale}
        visit={{
          id: 7,
          at: "2026-10-30T00:41:00Z",
          weeks: 21,
          pregnancyId: 11,
          pregnancyActive: true,
          mother: { id: 1, name: "Ana Marie Bautista" },
          recordedBy: "Joy Dela Cruz",
          appointment: { service: "Prenatal Checkup", at: "2026-10-30T00:30:00Z" },
          vitals: { bpSystolic: 110, bpDiastolic: 70, weightKg: 58.5, temperatureC: 36.6, pulseRate: 82, fundalHeightCm: 21, fetalHeartRate: 145 },
          notes: "Feeling well. Mild back pain at night.",
          services: [
            { serviceId: 1, name: "Prenatal Checkup", icon: "checkup", details: "Routine check", resultNotes: null },
            { serviceId: 2, name: "Tetanus Toxoid Vaccination", icon: "vaccine", details: "TT2", resultNotes: "Left arm" },
          ],
          editable: true,
          previousWeightKg: 57.4,
        }}
      />
    </StaffShell>
  );
}
