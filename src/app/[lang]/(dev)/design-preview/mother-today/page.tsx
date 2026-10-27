import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TodayView } from "@/features/mother-home/components/today-screen";
import type { MyToday } from "@/features/mother-home/types";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";
import { dueDateFromLmp } from "@/lib/utils/pregnancy";

export const metadata = { title: "Mother home preview", robots: { index: false } };

const TODAY = "2026-10-27";

// Development only (preview): the mother's Today screen with sample data.
// ?lmp=YYYY-MM-DD picks the week; ?none=1 shows "no current pregnancy".
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
  const data: MyToday = {
    firstName: "Ana",
    current: query.none ? null : { lmp, edd: dueDateFromLmp(lmp) },
    past: [{ id: 1, outcome: "LIVE_BIRTH", outcomeDate: "2023-11-14" }],
  };
  return (
    <MotherShell user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <TodayView t={t} locale={locale} data={data} today={TODAY} />
    </MotherShell>
  );
}
