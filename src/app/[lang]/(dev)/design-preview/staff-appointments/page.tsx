import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppointmentsView, CalendarView, ListView, QueueView } from "@/features/appointments/components/appointments-screen";
import { parseAppointmentFilters } from "@/features/appointments/queries/appointments";
import type { Service, StaffAppointment } from "@/features/appointments/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { manilaSlot } from "@/lib/appointments/slots";
import { SAMPLE_APPOINTMENTS, SAMPLE_NOW, SAMPLE_SLOTS } from "./sample";

export const metadata = { title: "Staff appointments preview", robots: { index: false } };

const TODAY = "2026-10-27";

// Today's visits, to show Record visit and the Today heading in the list.
const TODAYS: StaffAppointment[] = [
  { id: 21, status: "COMPLETED", requestedAt: "2026-10-27T00:00:00Z", scheduledAt: "2026-10-27T00:00:00Z", at: "2026-10-27T00:00:00Z", remarks: null, createdAt: "2026-10-12T01:00:00Z", service: "Prenatal Checkup", mother: { id: 21, name: "Rosemarie Tarog Rodriguez", contactNumber: "09267629295", hasLogin: true }, reminder: { status: "DELIVERED", at: "2026-10-26T00:00:00Z", sentAt: "2026-10-26T00:00:04Z", retryAt: null, reason: null } },
  { id: 22, status: "CONFIRMED", requestedAt: "2026-10-27T05:30:00Z", scheduledAt: "2026-10-27T05:30:00Z", at: "2026-10-27T05:30:00Z", remarks: null, createdAt: "2026-10-14T01:00:00Z", service: "Iron / Folic Acid Supplementation", mother: { id: 22, name: "Jennilyn Altura Dugan", contactNumber: "09167935761", hasLogin: false }, reminder: { status: "SENT", at: "2026-10-26T00:00:00Z", sentAt: "2026-10-26T00:00:06Z", retryAt: null, reason: null } },
];

// Development only (preview): the staff appointment views with sample data
// (?view=). The List's tabs and filters change the address and the
// highlighted tab (the rows stay the sample); ?empty=1 shows empty views.
// ?reminder=failed makes the confirmed visit's reminder a failed one;
// ?admin=1 shows what admins see (the SMS log link on it).
export default function StaffAppointmentsPreview({ searchParams }: PageProps<"/[lang]/design-preview/staff-appointments">) {
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
  const view = query.view;
  const isAdmin = query.admin === "1";
  const empty = query.empty === "1";
  const sample = [...SAMPLE_APPOINTMENTS, ...TODAYS];
  const appointments = empty
    ? []
    : query.reminder === "failed"
      ? sample.map((item) =>
          item.status === "CONFIRMED" && item.reminder ? { ...item, reminder: { ...item.reminder, status: "FAILED" as const, reason: "phone_offline" } } : item,
        )
      : sample;
  const services: Service[] = [
    { id: 1, name: "Prenatal Checkup", icon: "checkup" },
    { id: 2, name: "Tetanus Toxoid Vaccination", icon: "vaccine" },
    { id: 3, name: "Iron / Folic Acid Supplementation", icon: "supplement" },
    { id: 4, name: "Laboratory Test", icon: "lab" },
    { id: 5, name: "Health Education Session", icon: "education" },
  ];
  const bySlot = [...appointments].filter((item) => item.status !== "CANCELLED").sort((a, b) => a.at.localeCompare(b.at));
  const byDay: Record<string, StaffAppointment[]> = {};
  for (const item of bySlot) (byDay[manilaSlot(item.at).date] ??= []).push(item);
  const requests = appointments.filter((item) => item.status === "REQUESTED").sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const body =
    view === "list" ? (
      <ListView
        t={t}
        locale={locale}
        items={bySlot}
        total={empty ? 0 : 46}
        counts={empty ? { all: 0, upcoming: 0, REQUESTED: 0, MISSED: 0, COMPLETED: 0, CANCELLED: 0 } : { all: 46, upcoming: 18, REQUESTED: 3, MISSED: 4, COMPLETED: 21, CANCELLED: 5 }}
        filters={parseAppointmentFilters(query)}
        services={services}
        slots={SAMPLE_SLOTS}
        today={TODAY}
        now={SAMPLE_NOW}
        isAdmin={isAdmin}
      />
    ) : view === "calendar" ? (
      <CalendarView t={t} locale={locale} month="2026-10" day={TODAY} today={TODAY} byDay={byDay} closedDays={SAMPLE_SLOTS.closedDays} slots={SAMPLE_SLOTS} now={SAMPLE_NOW} isAdmin={isAdmin} />
    ) : (
      <QueueView t={t} locale={locale} items={requests} slots={SAMPLE_SLOTS} today={TODAY} now={SAMPLE_NOW} />
    );
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }} badges={{ appointments: requests.length }}>
      <AppointmentsView
        t={t}
        view={view === "list" || view === "calendar" ? view : "queue"}
        counts={empty ? { requests: 0, today: 0, week: 0, missed: 0 } : { requests: requests.length, today: 2, week: 9, missed: 2 }}
        today={TODAY}
      >
        {body}
      </AppointmentsView>
    </StaffShell>
  );
}
