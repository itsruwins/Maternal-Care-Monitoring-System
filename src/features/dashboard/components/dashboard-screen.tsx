import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { getAdminDashboard } from "../queries/admin-dashboard";
import { getDashboardCounts, getStaffFirstName, listDueSoon } from "../queries/staff-dashboard";
import type { AdminDashboard, DashboardCounts, DueSoonItem } from "../types";
import { AccountsCard } from "./accounts-card";
import { CountTiles } from "./count-tiles";
import { DueSoonList } from "./due-soon-list";
import { GreetingPanel } from "./greeting-panel";
import { SmsHealthCard } from "./sms-health-card";

// /staff: the staff dashboard (health workers and admins). Today's
// appointments come from the visits feature as a slot. Admins also get the
// Admin section. Reads the session: render inside <Suspense>.
export async function DashboardScreen({ todayList }: { todayList: ReactNode }) {
  const user = await requireRole(AREA_ROLES.staff);
  const today = manilaTodayISO();
  const [{ t, locale }, firstName, counts, due, admin] = await Promise.all([
    getServerI18n(),
    getStaffFirstName(user),
    getDashboardCounts(today),
    listDueSoon(today),
    user.role === "ADMIN" ? getAdminDashboard(today) : Promise.resolve(null),
  ]);
  return (
    <DashboardView
      t={t}
      locale={locale}
      firstName={firstName}
      today={today}
      counts={counts}
      due={due}
      todayList={todayList}
      admin={admin}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function DashboardView({
  t,
  locale,
  firstName,
  today,
  counts,
  due,
  todayList,
  admin,
}: {
  t: Dictionary;
  locale: Locale;
  firstName: string;
  today: string;
  counts: DashboardCounts;
  due: DueSoonItem[];
  todayList: ReactNode;
  admin: AdminDashboard | null;
}) {
  const d = t.dashboard;
  return (
    <div className="flex flex-col gap-6">
      <GreetingPanel t={t} locale={locale} firstName={firstName} today={today} />
      <CountTiles t={t} counts={counts} />

      {/* Side by side from 1280px; at 1024px the sidebar leaves too little room. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <section aria-labelledby="dash-today" className="flex min-w-0 flex-col gap-3">
          <h2 id="dash-today" className="text-lg font-bold">
            {d.todayTitle}
          </h2>
          {todayList}
        </section>
        <section aria-labelledby="dash-due" className="flex min-w-0 flex-col gap-3">
          <h2 id="dash-due" className="text-lg font-bold">
            {d.due.title}
          </h2>
          <DueSoonList t={t} locale={locale} items={due} total={counts.dueSoon} />
        </section>
      </div>

      {admin && (
        <section aria-labelledby="dash-admin" className="flex flex-col gap-3">
          <h2 id="dash-admin" className="text-lg font-bold">
            {d.admin.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
            <AccountsCard t={t} locale={locale} counts={admin.accounts} today={today} />
            <SmsHealthCard t={t} locale={locale} sms={admin.sms} today={today} />
          </div>
        </section>
      )}
    </div>
  );
}
