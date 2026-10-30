import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RebookView } from "@/features/follow-ups/components/rebook-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { SAMPLE_CLOSED, SAMPLE_OPEN } from "../follow-ups/sample";

export const metadata = { title: "Rebook preview", robots: { index: false } };

// Development only (preview): booking a new appointment for a missed visit
// (?sorted=1: the item was already sorted out).
export default function RebookPreview({ searchParams }: PageProps<"/[lang]/design-preview/follow-ups-rebook">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getServerI18n();
  const sorted = (await searchParams).sorted === "1";
  const item = sorted ? SAMPLE_CLOSED[0] : SAMPLE_OPEN[0];
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <RebookView
        t={t}
        locale={locale}
        item={item}
        mother={{ id: item.mother.id, pregnancyId: 31, name: item.mother.name, contactNumber: item.mother.contactNumber, weeks: 24 }}
        services={[
          { id: 1, name: "Prenatal Checkup", icon: "checkup" },
          { id: 2, name: "Tetanus Toxoid Vaccination", icon: "vaccine" },
          { id: 3, name: "Iron / Folic Acid Supplementation", icon: "supplement" },
          { id: 5, name: "Health Education Session", icon: "education" },
        ]}
        slots={{ first: "2026-11-06", last: "2027-05-06", closedDays: ["2026-11-30"], taken: ["2026-11-09T08:00", "2026-11-09T08:30", "2026-11-09T09:00", "2026-11-09T13:30"] }}
        suggested="2026-11-09"
      />
    </StaffShell>
  );
}
