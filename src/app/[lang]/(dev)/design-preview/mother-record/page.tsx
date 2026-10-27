import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MotherRecordView, RECORD_TABS, type RecordTab } from "@/features/mothers/components/mother-record-screen";
import type { MotherRecord } from "@/features/mothers/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { dueDateFromLmp } from "@/lib/utils/pregnancy";

export const metadata = { title: "Mother record preview", robots: { index: false } };

const SAMPLE: MotherRecord = {
  id: 1,
  firstName: "Ana Marie",
  middleName: "Santos",
  lastName: "Bautista",
  dateOfBirth: "1998-04-12",
  contactNumber: "09171234567",
  purokId: 3,
  purokName: "Purok 3",
  street: "12 Rizal St.",
  emergencyName: "Jose Bautista",
  emergencyNumber: "09191234567",
  registrationDate: "2026-07-02",
  registeredBy: "Joy Dela Cruz",
  selfSignup: false,
  current: { id: 11, gravida: 2, para: 1, lmp: "2026-06-01", edd: "2027-03-08", status: "ACTIVE", outcome: null, outcomeDate: null, registrationDate: "2026-07-02", remarks: null },
  past: [
    { id: 10, gravida: 1, para: 0, lmp: null, edd: "2023-11-20", status: "DELIVERED", outcome: "LIVE_BIRTH", outcomeDate: "2023-11-14", registrationDate: "2026-07-02", remarks: "Normal delivery at the health center." },
  ],
  login: { userId: "x", username: "ana.bautista", status: "ACTIVE", lastLoginAt: "2026-10-20T01:30:00Z", mustChangePassword: true, email: null },
};

// Development only (preview): a mother's record with sample data (?tab=, ?login=none, ?current=none, ?lmp=YYYY-MM-DD).
export default function MotherRecordPreview({ searchParams }: PageProps<"/[lang]/design-preview/mother-record">) {
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
  const tab = RECORD_TABS.includes(query.tab as RecordTab) ? (query.tab as RecordTab) : "overview";
  const mother: MotherRecord = {
    ...SAMPLE,
    login: query.login === "none" ? null : SAMPLE.login,
    current:
      query.current === "none"
        ? null
        : typeof query.lmp === "string" && SAMPLE.current
          ? { ...SAMPLE.current, lmp: query.lmp, edd: dueDateFromLmp(query.lmp) }
          : SAMPLE.current,
  };
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <MotherRecordView
        t={t}
        locale={locale}
        mother={mother}
        tab={tab}
        puroks={Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}` }))}
        today="2026-10-27"
      />
    </StaffShell>
  );
}
