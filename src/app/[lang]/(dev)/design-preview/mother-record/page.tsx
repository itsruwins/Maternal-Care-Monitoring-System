import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MotherRecordView, RECORD_TABS, type RecordTab } from "@/features/mothers/components/mother-record-screen";
import type { MotherRecord } from "@/features/mothers/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { MotherAppointmentsPanelView } from "@/features/appointments/components/mother-appointments-panel";
import { MotherFollowUpsPanelView } from "@/features/follow-ups/components/mother-follow-ups-panel";
import { MotherSmsPanelView } from "@/features/sms/components/mother-sms-panel";
import type { FollowUpItem } from "@/features/follow-ups/types";
import { MotherVisitsPanelView } from "@/features/visits/components/mother-visits-panel";
import { getServerI18n } from "@/i18n/server";
import { SAMPLE_CLOSED, SAMPLE_OPEN, SAMPLE_TODAY } from "../follow-ups/sample";
import { SAMPLE_SMS } from "../sms/sample";
import { SAMPLE_APPOINTMENTS, SAMPLE_SLOTS } from "../staff-appointments/sample";
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

// Ana's missed visits, newest first (two still open).
const HER_FOLLOW_UPS: FollowUpItem[] = [SAMPLE_OPEN[2], SAMPLE_OPEN[0], SAMPLE_CLOSED[0], SAMPLE_CLOSED[1]].map((item) => ({
  ...item,
  mother: { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567", purok: "Purok 3" },
}));

// Development only (preview): a mother's record with sample data (?tab=, ?login=none, ?current=none, ?lmp=YYYY-MM-DD,
// ?admin=1 (Delete on follow-ups, Retry on texts), ?followUps=none, ?sms=none).
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
  const isAdmin = query.admin === "1";
  const followUps = query.followUps === "none" ? [] : HER_FOLLOW_UPS;
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
    <StaffShell
      user={
        isAdmin
          ? { username: "taysan.admin", role: "ADMIN", firstName: "Liza", fullName: "Liza Ramos" }
          : { username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }
      }
    >
      <MotherRecordView
        t={t}
        locale={locale}
        mother={mother}
        tab={tab}
        puroks={Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}` }))}
        today="2026-10-27"
        openFollowUps={followUps.filter((item) => item.isOpen).length}
        followUps={
          <MotherFollowUpsPanelView
            t={t}
            locale={locale}
            // Admins may change any follow-up (the real list works this out per entry).
            items={isAdmin ? followUps.map((item) => ({ ...item, entries: item.entries.map((entry) => ({ ...entry, canEdit: true })) })) : followUps}
            today={SAMPLE_TODAY}
            isAdmin={isAdmin}
          />
        }
        sms={<MotherSmsPanelView t={t} locale={locale} items={query.sms === "none" ? [] : SAMPLE_SMS} canRetry={isAdmin} />}
        visits={
          <MotherVisitsPanelView
            t={t}
            locale={locale}
            motherId={1}
            canRecord
            visits={[
              { id: 7, at: "2026-10-30T00:41:00Z", weeks: 21, bp: "110/70", weightKg: 58.5, services: ["Prenatal Checkup", "Tetanus Toxoid Vaccination"], currentPregnancy: true },
              { id: 4, at: "2026-10-02T01:10:00Z", weeks: 17, bp: "108/68", weightKg: 57.4, services: ["Prenatal Checkup"], currentPregnancy: true },
              { id: 1, at: "2023-09-01T01:00:00Z", weeks: 38, bp: "112/72", weightKg: 63, services: [], currentPregnancy: false },
            ]}
          />
        }
        appointments={
          <MotherAppointmentsPanelView
            t={t}
            locale={locale}
            motherId={1}
            canBook
            items={[...SAMPLE_APPOINTMENTS.filter((item) => item.id !== 2), { ...SAMPLE_APPOINTMENTS[2], id: 9, status: "COMPLETED" as const, at: "2026-10-01T01:00:00Z" }].sort((a, b) =>
              a.at.localeCompare(b.at),
            )}
            slots={SAMPLE_SLOTS}
            now="2026-10-27T00:00:00Z"
          />
        }
      />
    </StaffShell>
  );
}
