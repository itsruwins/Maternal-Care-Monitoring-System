import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MothersView } from "@/features/mothers/components/mothers-screen";
import { parseMotherFilters } from "@/features/mothers/queries/list-mothers";
import type { MotherListItem } from "@/features/mothers/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Mothers preview", robots: { index: false } };

/** The preview's "today". */
const TODAY = "2026-11-04";

const SAMPLE: MotherListItem[] = [
  { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567", purok: "Purok 3", hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-03-08", weeks: 21, trimester: 2 } },
  { id: 2, name: "Carla Dela Cruz", contactNumber: "09181112222", purok: "Purok 1", hasLogin: false, pregnancy: { kind: "active", dueDate: "2026-11-20", weeks: 37, trimester: 3 } },
  { id: 6, name: "Jennilyn Altura Dugan", contactNumber: "09167935761", purok: "Purok 3", hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-06-24", weeks: 6, trimester: 1 } },
  { id: 3, name: "Grace Mendoza", contactNumber: "09193334444", purok: null, hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-05-20", weeks: 10, trimester: 1 } },
  { id: 4, name: "Joy Ramos", contactNumber: "09205556666", purok: "Sitio Upper Tico-tico", hasLogin: false, pregnancy: { kind: "closed", outcome: "LIVE_BIRTH", outcomeDate: "2026-09-14" } },
  { id: 7, name: "Rosemarie Tarog Rodriguez", contactNumber: "09267629295", purok: "Purok 3", hasLogin: true, pregnancy: { kind: "active", dueDate: "2026-10-26", weeks: 41, trimester: 3 } },
  { id: 5, name: "Liza Santos", contactNumber: "09217778888", purok: "Purok 7", hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-01-15", weeks: 30, trimester: 3 } },
  { id: 8, name: "Marites Villanueva", contactNumber: "09351239876", purok: "Purok 5", hasLogin: false, pregnancy: { kind: "none" } },
];

// Development only (preview): the mother registry with sample data. The tabs,
// sort and filters change the address and the highlighted tab (the rows stay
// the sample); ?empty=1 shows the empty list, ?page=2 the second page.
export default function MothersPreview({ searchParams }: PageProps<"/[lang]/design-preview/mothers">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/mothers">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const filters = parseMotherFilters(params);
  const empty = params.empty === "1";
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <MothersView
        t={t}
        locale={locale}
        today={TODAY}
        items={empty ? [] : SAMPLE}
        total={empty ? 0 : 46}
        counts={empty ? { all: 0, pregnant: 0, dueSoon: 0, notPregnant: 0 } : { all: 58, pregnant: 41, dueSoon: 6, notPregnant: 17 }}
        filters={filters}
        puroks={Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}` }))}
        dueMonths={["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09"]}
      />
    </StaffShell>
  );
}
