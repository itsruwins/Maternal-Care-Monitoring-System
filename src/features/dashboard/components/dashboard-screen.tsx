import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { dayPartOf } from "../format";
import { getAdminDashboard } from "../queries/admin-dashboard";
import {
  getDashboardCounts,
  getStaffFirstName,
  listDueSoon,
  listOpenFollowUps,
  listVisitsByDay,
  listWaitingRequests,
} from "../queries/staff-dashboard";
import type {
  AdminDashboard,
  DashboardContext,
  DashboardCounts,
  DayPart,
  DueSoonItem,
  FollowUpItem,
  RequestItem,
  VisitDay,
} from "../types";
import { AccountsStrip } from "./accounts-strip";
import { AttentionCard } from "./attention-card";
import { DashCard } from "./dash-card";
import { DashboardHeader } from "./dashboard-header";
import { DueSoonList } from "./due-soon-list";
import { KpiCards } from "./kpi-cards";
import { SmsHealthCard } from "./sms-health-card";
import { VisitsByDayChart } from "./visits-by-day-chart";

// /staff: the staff dashboard (health workers and admins). Today's schedule
// comes from the visits feature as a slot. Admins also get the Admin section
// and text problems under "Needs attention". Reads the session: render
// inside <Suspense>.
export async function DashboardScreen({ todayList }: { todayList: ReactNode }) {
  const user = await requireRole(AREA_ROLES.staff);
  const today = manilaTodayISO();
  const [{ t, locale }, firstName, { counts, context }, due, requests, followUps, visitsByDay, admin] = await Promise.all([
    getServerI18n(),
    getStaffFirstName(user),
    getDashboardCounts(today),
    listDueSoon(today),
    listWaitingRequests(),
    listOpenFollowUps(),
    listVisitsByDay(today),
    user.role === "ADMIN" ? getAdminDashboard(today) : Promise.resolve(null),
  ]);
  return (
    <DashboardView
      t={t}
      locale={locale}
      firstName={firstName}
      today={today}
      dayPart={dayPartOf()}
      counts={counts}
      context={context}
      due={due}
      requests={requests}
      followUps={followUps}
      visitsByDay={visitsByDay}
      todayList={todayList}
      admin={admin}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
//
// Head, the five counts, then the work area. From 1280px it is two columns
// (1.65 : 1): today's schedule over the 30-day chart on the left, "Needs
// attention" over "Due within 30 days" on the right. Below 1280px one column
// in the order of the day's work: schedule, needs attention, due, chart.
// Admins then get the Admin section on the same two columns.
export function DashboardView({
  t,
  locale,
  firstName,
  today,
  dayPart,
  counts,
  context,
  due,
  requests,
  followUps,
  visitsByDay,
  todayList,
  admin,
}: {
  t: Dictionary;
  locale: Locale;
  firstName: string;
  today: string;
  dayPart: DayPart;
  counts: DashboardCounts;
  context: DashboardContext;
  due: DueSoonItem[];
  requests: RequestItem[];
  followUps: FollowUpItem[];
  visitsByDay: VisitDay[];
  todayList: ReactNode;
  admin: AdminDashboard | null;
}) {
  const d = t.dashboard;
  const sms = admin ? { failed: admin.sms.failed, phoneOffline: admin.sms.phoneOnline === false } : null;
  const columns = "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] xl:items-start";

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <DashboardHeader t={t} locale={locale} firstName={firstName} today={today} dayPart={dayPart} />
      <KpiCards t={t} locale={locale} counts={counts} context={context} />

      <div className={columns}>
        {/* "contents" below 1280px lets the four cards take the work order. */}
        <div className="contents xl:flex xl:flex-col xl:gap-6">
          <DashCard id="dash-today" title={d.schedule.title} link={{ href: "/staff/visits", label: d.schedule.seeAll }} className="order-1">
            {todayList}
          </DashCard>
          <div className="order-4 min-w-0">
            <VisitsByDayChart t={t} locale={locale} days={visitsByDay} today={today} />
          </div>
        </div>
        <div className="contents xl:flex xl:flex-col xl:gap-6">
          <div className="order-2 min-w-0">
            <AttentionCard t={t} locale={locale} counts={counts} requests={requests} followUps={followUps} sms={sms} />
          </div>
          <div className="order-3 min-w-0">
            <DueSoonList t={t} locale={locale} items={due} total={counts.dueSoon} />
          </div>
        </div>
      </div>

      {admin && (
        <section aria-labelledby="dash-admin" className="flex flex-col gap-4">
          <h2 id="dash-admin" className="text-lg font-bold">
            {d.admin.title}
          </h2>
          <div className={columns}>
            <AccountsStrip t={t} locale={locale} counts={admin.accounts} today={today} />
            <SmsHealthCard t={t} locale={locale} sms={admin.sms} today={today} />
          </div>
        </section>
      )}
    </div>
  );
}
