import { notFound } from "next/navigation";
import { RecordVisitView } from "@/features/visits/components/record-visit-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { SAMPLE_VISIT_SERVICES } from "../visits/sample";

export const metadata = { title: "Record visit preview", robots: { index: false } };

// Development only (preview): the visit form for a mother with an appointment
// (saving needs a real login).
export default async function RecordVisitPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <RecordVisitView
        t={t}
        locale={locale}
        context={{
          mother: { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567" },
          pregnancyId: 11,
          weeks: 21,
          lastWeightKg: 57.4,
          appointment: { id: 2, at: "2026-10-30T01:00:00Z", serviceId: 1, service: "Prenatal Checkup" },
        }}
        services={SAMPLE_VISIT_SERVICES}
        q=""
        results={[]}
        searched={false}
      />
    </StaffShell>
  );
}
