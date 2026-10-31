import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { MissedVisit } from "@/features/mother-appointments/types";
import { TodayView } from "@/features/mother-home/components/today-screen";
import type { MyToday } from "@/features/mother-home/types";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";
import { dueDateFromLmp } from "@/lib/utils/pregnancy";

export const metadata = { title: "Mother home preview", robots: { index: false } };

const TODAY = "2026-10-27";

const MISSED: MissedVisit[] = [
  { id: 6, service: "Prenatal Checkup", at: "2026-10-23T01:00:00Z" },
  { id: 7, service: "Tetanus Toxoid Vaccination", at: "2026-10-23T01:30:00Z" },
];

// Development only (preview): the mother's Today screen with sample data.
// ?lmp=YYYY-MM-DD picks the week; ?none=1 shows "no current pregnancy";
// ?missed=1 or 2 shows the missed-visit notice; ?next=none drops her booked visits.
export default function MotherTodayPreview({ searchParams }: PageProps<"/[lang]/design-preview/mother-today">) {
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
  const lmp = typeof query.lmp === "string" ? query.lmp : "2026-06-01";
  const booked = query.next !== "none";
  const data: MyToday = {
    firstName: "Ana",
    current: query.none ? null : { lmp, edd: dueDateFromLmp(lmp) },
    past: [{ id: 1, outcome: "LIVE_BIRTH", outcomeDate: "2023-11-14" }],
    visits: [
      { at: "2026-10-26T01:00:00Z", service: "Iron / Folic Acid Supplementation", status: "COMPLETED" },
      ...(booked
        ? [
            { at: "2026-10-29T01:00:00Z", service: "Prenatal Checkup", status: "CONFIRMED" as const },
            { at: "2026-10-30T05:30:00Z", service: "Laboratory Test", status: "REQUESTED" as const },
          ]
        : []),
    ],
    nextVisit: booked ? { at: "2026-10-29T01:00:00Z", service: "Prenatal Checkup", status: "CONFIRMED" } : null,
  };
  const missed = MISSED.slice(0, Number(query.missed) || 0);
  return (
    <MotherShell previewPath="/mother" user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <TodayView t={t} locale={locale} data={data} missed={missed} today={TODAY} />
    </MotherShell>
  );
}
