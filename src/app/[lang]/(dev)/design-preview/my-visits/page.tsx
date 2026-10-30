import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MyVisitDetailView, MyVisitsView } from "@/features/mother-visits/components/my-visits-screen";
import type { MyVisitRow } from "@/features/mother-visits/types";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Mother visits preview", robots: { index: false } };

const VISITS: MyVisitRow[] = [
  { id: 7, at: "2026-10-30T00:41:00Z", weeks: 21, bpSystolic: 112, bpDiastolic: 72, weightKg: 58.5, services: ["Prenatal Checkup", "Tetanus Toxoid Vaccination"], currentPregnancy: true },
  { id: 6, at: "2026-10-02T01:10:00Z", weeks: 17, bpSystolic: 108, bpDiastolic: 68, weightKg: 57.4, services: ["Prenatal Checkup"], currentPregnancy: true },
  { id: 5, at: "2026-09-04T01:10:00Z", weeks: 13, bpSystolic: 110, bpDiastolic: 70, weightKg: 56.1, services: ["Iron / Folic Acid Supplementation"], currentPregnancy: true },
  { id: 4, at: "2026-08-07T01:10:00Z", weeks: 9, bpSystolic: 104, bpDiastolic: 66, weightKg: 55.8, services: ["Prenatal Checkup"], currentPregnancy: true },
];

// Development only (preview): the mother's Visits page (?visit=1 shows a visit).
export default function MyVisitsPreview({ searchParams }: PageProps<"/[lang]/design-preview/my-visits">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getServerI18n();
  const detail = (await searchParams).visit;
  return (
    <MotherShell previewPath="/mother/visits" user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      {detail ? (
        <MyVisitDetailView
          t={t}
          locale={locale}
          visit={{
            id: 7,
            at: "2026-10-30T00:41:00Z",
            weeks: 21,
            vitals: { bpSystolic: 112, bpDiastolic: 72, weightKg: 58.5, temperatureC: 36.6, pulseRate: 82, fundalHeightCm: 21, fetalHeartRate: 145 },
            services: [
              { name: "Prenatal Checkup", icon: "checkup", details: "Routine check", resultNotes: null },
              { name: "Tetanus Toxoid Vaccination", icon: "vaccine", details: "TT2", resultNotes: "Left arm" },
            ],
          }}
        />
      ) : (
        <MyVisitsView
          t={t}
          locale={locale}
          data={{ hasCurrentPregnancy: true, next: { at: "2026-11-27T01:00:00Z", service: "Prenatal Checkup", status: "CONFIRMED" }, visits: VISITS }}
        />
      )}
    </MotherShell>
  );
}
