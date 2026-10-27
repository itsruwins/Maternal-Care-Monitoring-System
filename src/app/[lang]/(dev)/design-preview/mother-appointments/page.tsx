import { notFound } from "next/navigation";
import { MyAppointmentsView } from "@/features/mother-appointments/components/my-appointments-screen";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Mother appointments preview", robots: { index: false } };

// Development only (preview): the mother's appointments with sample data
// ("today" is 2026-10-27).
export default async function MotherAppointmentsPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <MotherShell user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <MyAppointmentsView
        t={t}
        locale={locale}
        today="2026-10-27"
        data={{
          pregnancyId: 1,
          upcoming: [
            { id: 3, service: "Tetanus Toxoid Vaccination", status: "RESCHEDULED", requestedAt: "2026-11-03T01:00:00Z", scheduledAt: "2026-11-04T05:30:00Z", remarks: "Morning slots are full that week." },
            { id: 1, service: "Prenatal Checkup", status: "CONFIRMED", requestedAt: "2026-11-05T01:00:00Z", scheduledAt: "2026-11-05T01:00:00Z", remarks: null },
            { id: 2, service: "Laboratory Test", status: "REQUESTED", requestedAt: "2026-11-12T02:30:00Z", scheduledAt: null, remarks: "First time for blood test" },
          ],
          past: [
            { id: 4, service: "Prenatal Checkup", status: "COMPLETED", requestedAt: "2026-10-01T01:00:00Z", scheduledAt: "2026-10-01T01:00:00Z", remarks: null },
            { id: 5, service: "Health Education Session", status: "CANCELLED", requestedAt: "2026-09-15T05:00:00Z", scheduledAt: null, remarks: null },
          ],
        }}
      />
    </MotherShell>
  );
}
