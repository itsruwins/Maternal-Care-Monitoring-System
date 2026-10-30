import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppointmentsView, CalendarView, ListView, QueueView } from "@/features/appointments/components/appointments-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { manilaSlot } from "@/lib/appointments/slots";
import type { Service } from "@/features/appointments/types";
import { SAMPLE_APPOINTMENTS, SAMPLE_NOW, SAMPLE_SLOTS } from "./sample";

export const metadata = { title: "Staff appointments preview", robots: { index: false } };

// Development only (preview): the staff appointment views with sample data (?view=).
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
  const view = (await searchParams).view;
  const services: Service[] = [
    { id: 1, name: "Prenatal Checkup", icon: "checkup" },
    { id: 2, name: "Tetanus Toxoid Vaccination", icon: "vaccine" },
    { id: 3, name: "Iron / Folic Acid Supplementation", icon: "supplement" },
    { id: 4, name: "Laboratory Test", icon: "lab" },
    { id: 5, name: "Health Education Session", icon: "education" },
  ];
  const bySlot = [...SAMPLE_APPOINTMENTS].sort((a, b) => a.at.localeCompare(b.at));
  const byDay: Record<string, typeof SAMPLE_APPOINTMENTS> = {};
  for (const item of SAMPLE_APPOINTMENTS) (byDay[manilaSlot(item.at).date] ??= []).push(item);

  const body =
    view === "list" ? (
      <ListView t={t} locale={locale} items={bySlot} total={bySlot.length} filters={{ status: "", service: "", from: "", to: "", page: 1 }} services={services} slots={SAMPLE_SLOTS} now={SAMPLE_NOW} />
    ) : view === "calendar" ? (
      <CalendarView t={t} locale={locale} month="2026-11" day="2026-11-05" today="2026-10-27" byDay={byDay} closedDays={SAMPLE_SLOTS.closedDays} slots={SAMPLE_SLOTS} now={SAMPLE_NOW} />
    ) : (
      <QueueView
        t={t}
        locale={locale}
        items={SAMPLE_APPOINTMENTS.filter((item) => item.status === "REQUESTED").sort((a, b) => a.createdAt.localeCompare(b.createdAt))}
        slots={SAMPLE_SLOTS}
        now={SAMPLE_NOW}
      />
    );
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <AppointmentsView t={t} view={view === "list" || view === "calendar" ? view : "queue"} requestCount={3}>
        {body}
      </AppointmentsView>
    </StaffShell>
  );
}
