import Link from "next/link";
import { CheckCircleIcon, CheckupIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot, formatSlotClock } from "@/lib/appointments/format";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatDate } from "@/lib/utils/pregnancy";
import { listRecentVisits, listTodayAppointments } from "../queries/visits";
import type { RecentVisit, TodayAppointment } from "../types";

// /staff/visits: today's appointments (Record visit), Walk-in visit, and the
// latest visits. Reads the session: render inside <Suspense>.
export async function VisitsScreen() {
  await requireRole(AREA_ROLES.staff);
  const today = manilaTodayISO();
  const [{ t, locale }, todays, recent] = await Promise.all([getServerI18n(), listTodayAppointments(today), listRecentVisits()]);
  return <VisitsView t={t} locale={locale} today={today} todays={todays} recent={recent} />;
}

// The page layout, without data loading (also used by the dev preview).
export function VisitsView({
  t,
  locale,
  today,
  todays,
  recent,
}: {
  t: Dictionary;
  locale: Locale;
  today: string;
  todays: TodayAppointment[];
  recent: RecentVisit[];
}) {
  const v = t.visits;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{v.title}</h1>
          <p className="mt-2 text-ink-soft">{v.intro}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/staff/visits/new">
            <PlusIcon weight="bold" aria-hidden />
            {v.walkIn}
          </Link>
        </Button>
      </div>

      <section aria-labelledby="visits-today" className="flex flex-col gap-3">
        <h2 id="visits-today" className="text-lg font-bold">
          {v.today} · <span className="font-semibold text-ink-soft">{formatDate(today, locale)}</span>
        </h2>
        {todays.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{v.todayEmpty}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {todays.map((item) => (
              <li key={item.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
                <span className="tnum grid h-14 w-20 shrink-0 place-items-center rounded-2xl bg-mint text-[0.95rem] font-bold text-leaf">
                  {formatSlotClock(item.at, locale)}
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/staff/mothers/${item.mother.id}`}
                    className="block font-semibold break-words text-ink no-underline hover:text-leaf hover:underline"
                  >
                    {item.mother.name}
                  </Link>
                  <span className="block text-sm break-words text-ink-soft">{item.service}</span>
                </span>
                {item.visitId ? (
                  <Link
                    href={`/staff/visits/${item.visitId}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf underline decoration-1 underline-offset-4"
                  >
                    <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
                    {v.recorded}
                  </Link>
                ) : (
                  <Button asChild size="sm" className="shrink-0">
                    <Link href={`/staff/visits/new?appointment=${item.id}`}>
                      <CheckupIcon weight="bold" aria-hidden />
                      {v.record}
                    </Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="visits-recent" className="flex flex-col gap-3">
        <h2 id="visits-recent" className="text-lg font-bold">
          {v.recent}
        </h2>
        {recent.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{v.recentEmpty}</p>
        ) : (
          <ul className="divide-y divide-line rounded-3xl bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
            {recent.map((visit) => (
              <li key={visit.id} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/staff/visits/${visit.id}`}
                    className="font-semibold break-words text-ink no-underline hover:text-leaf hover:underline"
                  >
                    {visit.mother.name}
                  </Link>
                  <span className="tnum block text-sm text-ink-soft">{formatSlot(visit.at, locale, "short")}</span>
                </span>
                <span className="tnum flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{format(v.weekShort, { weeks: visit.weeks })}</span>
                  <span>BP {visit.bp}</span>
                  <span>{visit.weightKg} kg</span>
                  <span>
                    {visit.servicesCount === 0 ? v.noServices : visit.servicesCount === 1 ? v.servicesOne : format(v.servicesCount, { count: visit.servicesCount })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
