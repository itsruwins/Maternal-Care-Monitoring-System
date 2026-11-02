import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MyAppointmentsView } from "@/features/mother-appointments/components/my-appointments-screen";
import type { MissedVisit, MyAppointment, MyReminder } from "@/features/mother-appointments/types";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Mother appointments preview", robots: { index: false } };

// "Now" is Tue 2026-10-27, 10:00 AM Manila.
const TODAY = "2026-10-27";
const NOW = "2026-10-27T02:00:00Z";

const MISSED: MissedVisit[] = [
  { id: 6, service: "Prenatal Checkup", at: "2026-10-23T01:00:00Z" },
  { id: 7, service: "Tetanus Toxoid Vaccination", at: "2026-10-23T01:30:00Z" },
];

const REMINDERS: Record<string, MyReminder> = {
  waiting: { status: "PENDING", at: "2026-11-04T01:00:00Z", sentAt: null, number: "09171234567", reason: null },
  sent: { status: "DELIVERED", at: "2026-11-04T01:00:00Z", sentAt: "2026-11-04T01:02:00Z", number: "09171234567", reason: null },
  failed: { status: "FAILED", at: "2026-11-04T01:00:00Z", sentAt: null, number: "09171234567", reason: "phone_offline" },
  number: { status: "FAILED", at: "2026-11-04T01:00:00Z", sentAt: null, number: "09171234567", reason: "bad_number" },
};

// Development only (preview): the mother's appointments with sample data.
// ?missed=1 or 2 adds the missed-visit notice; ?passed=1 adds a request whose
// time has passed; ?reminder=sent, failed (on our side) or number (her number
// can't be used) changes the confirmed visit's text reminder line (waiting by
// default; none hides it).
export default function MotherAppointmentsPreview({ searchParams }: PageProps<"/[lang]/design-preview/mother-appointments">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getServerI18n();
  const query = await searchParams;
  const missed = MISSED.slice(0, Number(query.missed) || 0);
  const reminder = REMINDERS[String(query.reminder ?? "waiting")] ?? null;
  const passed: MyAppointment[] = query.passed
    ? [{ id: 8, service: "Prenatal Checkup", status: "REQUESTED", requestedAt: "2026-10-26T01:00:00Z", scheduledAt: null, remarks: null, reminder: null }]
    : [];
  const missedRows: MyAppointment[] = missed
    .map((visit) => ({ id: visit.id, service: visit.service, status: "MISSED" as const, requestedAt: visit.at, scheduledAt: visit.at, remarks: null, reminder: null }))
    .reverse();

  return (
    <MotherShell previewPath="/mother/appointments" user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <MyAppointmentsView
        t={t}
        locale={locale}
        today={TODAY}
        now={NOW}
        missed={missed}
        data={{
          pregnancyId: 1,
          upcoming: [
            { id: 3, service: "Tetanus Toxoid Vaccination", status: "RESCHEDULED", requestedAt: "2026-11-03T01:00:00Z", scheduledAt: "2026-11-04T05:30:00Z", remarks: "Morning slots are full that week.", reminder: null },
            ...passed,
            { id: 1, service: "Prenatal Checkup", status: "CONFIRMED", requestedAt: "2026-11-05T01:00:00Z", scheduledAt: "2026-11-05T01:00:00Z", remarks: null, reminder },
            { id: 2, service: "Laboratory Test", status: "REQUESTED", requestedAt: "2026-11-12T02:30:00Z", scheduledAt: null, remarks: "First time for blood test", reminder: null },
          ],
          past: [
            ...missedRows,
            { id: 4, service: "Prenatal Checkup", status: "COMPLETED", requestedAt: "2026-10-01T01:00:00Z", scheduledAt: "2026-10-01T01:00:00Z", remarks: null, reminder: null },
            { id: 5, service: "Health Education Session", status: "CANCELLED", requestedAt: "2026-09-15T05:00:00Z", scheduledAt: null, remarks: null, reminder: null },
          ],
        }}
      />
    </MotherShell>
  );
}
