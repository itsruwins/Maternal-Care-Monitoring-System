import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DashboardView } from "@/features/dashboard/components/dashboard-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { TodayScheduleTable } from "@/features/visits/components/today-schedule-table";
import { getServerI18n } from "@/i18n/server";
import {
  SAMPLE_ADMIN,
  SAMPLE_CONTEXT,
  SAMPLE_COUNTS,
  SAMPLE_DUE,
  SAMPLE_FOLLOW_UPS,
  SAMPLE_REQUESTS,
  SAMPLE_TODAY,
  SAMPLE_TODAY_DATE,
  SAMPLE_VISITS_BY_DAY,
} from "./sample";

export const metadata = { title: "Staff dashboard preview", robots: { index: false } };

// Development only (preview): the staff dashboard with sample data.
// ?admin=1 adds the Admin section (?phone=online|offline, ?limit=1 for the
// monthly-limit notice, ?full=1 for a plan at its limit); ?empty=1 shows
// zero counts and the empty lists; ?more=1 gives the due list a "See all";
// ?part=afternoon|evening changes the greeting.
export default function StaffDashboardPreview({ searchParams }: PageProps<"/[lang]/design-preview/staff-dashboard">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/staff-dashboard">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const empty = params.empty === "1";
  const admin = params.admin === "1";
  const phone = params.phone === "online" ? true : params.phone === "offline" ? false : null;
  const counts = empty
    ? { today: 0, requests: 0, followUps: 0, pregnant: 0, dueSoon: 0 }
    : { ...SAMPLE_COUNTS, dueSoon: params.more === "1" ? 11 : SAMPLE_DUE.length };

  return (
    <StaffShell
      user={
        admin
          ? { username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }
          : { username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }
      }
    >
      <DashboardView
        t={t}
        locale={locale}
        firstName={admin ? "Maria" : "Joy"}
        today={SAMPLE_TODAY_DATE}
        dayPart={params.part === "afternoon" || params.part === "evening" ? params.part : "morning"}
        counts={counts}
        context={
          empty
            ? { todayDone: 0, todayMissed: 0, oldestRequestAt: null, oldestMissedAt: null, thirdTrimester: 0, pastDue: 0 }
            : SAMPLE_CONTEXT
        }
        due={empty ? [] : SAMPLE_DUE}
        requests={empty ? [] : SAMPLE_REQUESTS}
        followUps={empty ? [] : SAMPLE_FOLLOW_UPS}
        visitsByDay={empty ? SAMPLE_VISITS_BY_DAY.map((day) => ({ ...day, count: 0 })) : SAMPLE_VISITS_BY_DAY}
        todayList={<TodayScheduleTable t={t} locale={locale} items={empty ? [] : SAMPLE_TODAY} />}
        admin={
          admin
            ? {
                accounts: SAMPLE_ADMIN.accounts,
                sms: {
                  ...SAMPLE_ADMIN.sms,
                  phoneOnline: phone,
                  phoneStatusAt: phone === null ? null : "2026-11-02T00:02:00Z",
                  limitReachedAt: params.limit === "1" ? "2026-11-02T03:00:00Z" : null,
                  sentThisMonth: params.full === "1" ? 200 : SAMPLE_ADMIN.sms.sentThisMonth,
                },
              }
            : null
        }
      />
    </StaffShell>
  );
}
