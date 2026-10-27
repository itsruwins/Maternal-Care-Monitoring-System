import { notFound } from "next/navigation";
import { MothersView } from "@/features/mothers/components/mothers-screen";
import type { MotherListItem } from "@/features/mothers/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Mothers preview", robots: { index: false } };

const SAMPLE: MotherListItem[] = [
  { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567", purok: "Purok 3", hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-03-08", weeks: 21, trimester: 2 } },
  { id: 2, name: "Carla Dela Cruz", contactNumber: "09181112222", purok: "Purok 1", hasLogin: false, pregnancy: { kind: "active", dueDate: "2026-12-02", weeks: 35, trimester: 3 } },
  { id: 3, name: "Grace Mendoza", contactNumber: "09193334444", purok: null, hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-05-20", weeks: 10, trimester: 1 } },
  { id: 4, name: "Joy Ramos", contactNumber: "09205556666", purok: "Sitio Upper Tico-tico", hasLogin: false, pregnancy: { kind: "closed", outcome: "LIVE_BIRTH", outcomeDate: "2026-09-14" } },
  { id: 5, name: "Liza Santos", contactNumber: "09217778888", purok: "Purok 7", hasLogin: true, pregnancy: { kind: "active", dueDate: "2027-01-15", weeks: 28, trimester: 3 } },
];

// Development only (preview): the mother registry with sample data.
export default async function MothersPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <MothersView
        t={t}
        locale={locale}
        items={SAMPLE}
        total={46}
        filters={{ q: "", purok: "", due: "", status: "", page: 1 }}
        puroks={Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}` }))}
        dueMonths={["2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08"]}
      />
    </StaffShell>
  );
}
