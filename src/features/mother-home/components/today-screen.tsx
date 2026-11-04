import type { ReactNode } from "react";
import Link from "next/link";
import { CaretRightIcon, HealthCenterIcon, PlusIcon, PregnancyIcon, RecordsIcon, type Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { CurvedHero } from "@/components/ui/curved-hero";
import { IconCircle } from "@/components/ui/icon-circle";
import { WeekStrip, type WeekDay, type WeekDayState } from "@/components/ui/week-strip";
import { MissedVisitNotice } from "@/features/mother-appointments/components/missed-visit-notice";
import { getMyMissedVisits } from "@/features/mother-appointments/queries/get-my-missed-visits";
import type { MissedVisit } from "@/features/mother-appointments/types";
import { TrimesterPicture } from "@/features/mothers/components/trimester-picture";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { formatSlotClock } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { addDays, daysBetween, formatDate, gestationalAge, parseISODate, PREGNANCY_DAYS, trimesterFromWeeks, weekOf } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { weeklyTip } from "../pregnancy-guide";
import { getMyToday } from "../queries/get-my-today";
import { CenterDetails, CheckupsCard, DangerCard, HealthCenterCard, ProgressCard, TipCard } from "./today-cards";
import type { AppointmentStatus } from "@/types/database";
import type { MyToday, MyVisit } from "../types";

// The mother's home ("Today"), after Flo's pregnancy screen: this week's
// dates and a soft hero with her baby's picture and week, beside her checkups
// (next + last) and the pregnancy bar; then danger signs, this week's tip, the
// health center and her past pregnancies. One column on phones.
// Reads the session: render inside <Suspense>.
export async function TodayScreen() {
  const user = await requireRole(AREA_ROLES.mother);
  const [{ t, locale }, today, missed] = await Promise.all([getServerI18n(), getMyToday(user), getMyMissedVisits()]);
  return <TodayView t={t} locale={locale} data={today} missed={missed} today={manilaTodayISO()} />;
}

// The page layout, without data loading (also used by the dev preview).
// `missed`: her missed visits that are still open (the Next visit card notice).
export function TodayView({ t, locale, data, missed, today }: { t: Dictionary; locale: Locale; data: MyToday; missed: MissedVisit[]; today: string }) {
  const d = t.today;
  const intlLocale = locale === "fil" ? "fil-PH" : "en-PH";
  const longDate = new Intl.DateTimeFormat(intlLocale, { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
  const todayDate = parseISODate(today)!;

  // Weeks pregnant: from her LMP, or from the due date when the LMP is unknown.
  const current = data.current;
  const lmp = current ? (current.lmp ?? (current.edd ? addDays(current.edd, -PREGNANCY_DAYS) : null)) : null;
  const age = lmp ? gestationalAge(lmp, today) : null;
  const trimester = age ? trimesterFromWeeks(age.weeks) : null;
  const daysLeft = current?.edd ? daysBetween(today, current.edd) : null;
  const isPastDue = daysLeft !== null && daysLeft < 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-ink-soft">{longDate.format(todayDate)}</p>
        <h1 className="text-title mt-1 font-extrabold">{format(d.greeting, { name: data.firstName })}</h1>
      </div>

      {current && age ? (
        // Rows that always end level, whatever cards she has: the hero beside
        // her visits and the pregnancy bar (stretched to the same height),
        // then danger signs across the page, then the tip beside the health
        // center, then past pregnancies. On phones: one column, same order.
        <>
          {missed.length > 0 && (
            <MissedVisitNotice t={t} locale={locale} missed={missed} className="p-6 sm:p-7">
              <Button asChild className="w-full sm:w-auto sm:self-start">
                <Link href="/mother/appointments/new">
                  <PlusIcon weight="bold" aria-hidden />
                  {t.myAppointments.request}
                </Link>
              </Button>
            </MissedVisitNotice>
          )}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6">
          <CurvedHero tone="rose" curve="lg" className="h-full rounded-t-3xl px-4 pt-5 pb-14 sm:px-8">
            <h2 className="sr-only">{d.weekLabel}</h2>
            <WeekStrip days={weekDays(t, today, intlLocale, data.visits)} aria-label={d.weekLabel} className="mx-auto max-w-md" />
            <div className="mt-8 flex flex-col items-center text-center">
              {trimester && (
                <TrimesterPicture
                  trimester={trimester}
                  priority
                  className="size-48 shadow-[var(--shadow-raised)] ring-8 ring-white/60 sm:size-56"
                />
              )}
              <p className="mt-6 text-[2.75rem] leading-none font-extrabold tracking-[-0.02em] sm:text-[3.25rem]">
                {format(d.week, { weeks: age.weeks })}
              </p>
              <p className="mt-2 text-lg text-ink-soft">
                {trimester && d.trimesters[trimester - 1]} ·{" "}
                {format(age.days === 0 ? d.weeksOnly : age.days === 1 ? d.weeksDayOne : d.weeksDays, { weeks: age.weeks, days: age.days })}
              </p>
              {daysLeft !== null && (
                <p
                  className={cn(
                    "mt-4 inline-flex rounded-full px-4 py-1.5 font-semibold",
                    daysLeft < 0 ? "bg-white text-rose-deep" : "bg-white/80 text-ink",
                  )}
                >
                  {daysLeft > 1
                    ? format(d.dueIn, { days: daysLeft })
                    : daysLeft === 1
                      ? d.dueInOne
                      : daysLeft === 0
                        ? d.dueToday
                        : format(d.overdue, { days: -daysLeft })}
                </p>
              )}
              {current.edd && <p className="tnum mt-3 text-ink-soft">{format(d.dueOn, { date: formatDate(current.edd, locale) })}</p>}
              <p className="mt-1 max-w-[36ch] text-sm text-ink-soft">{current.lmp ? d.countedFromLmp : d.countedFromEdd}</p>
            </div>
          </CurvedHero>
            <div className="flex flex-col gap-5 lg:gap-6">
              <CheckupsCard
                t={t}
                locale={locale}
                next={data.nextVisit}
                last={data.lastVisit}
                canRequest={missed.length === 0}
                className="lg:flex-1"
              />
              {lmp && (
                <ProgressCard
                  t={t}
                  locale={locale}
                  lmp={lmp}
                  edd={current.edd}
                  weeks={age.weeks}
                  daysPregnant={age.weeks * 7 + age.days}
                  isPastDue={isPastDue}
                />
              )}
            </div>
          </div>

          <DangerCard t={t} wide />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6">
            <TipCard t={t} tip={weeklyTip(d.tips, d.tipPastDue, age.weeks, isPastDue)} />
            <HealthCenterCard t={t} locale={locale} />
          </div>

          <History t={t} locale={locale} data={data} />
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <NoPregnancy t={t} locale={locale} />
            <History t={t} locale={locale} data={data} />
          </div>
          <DangerCard t={t} />
        </div>
      )}
    </div>
  );
}

// Which week-strip style a visit gives its day (a booked visit wins over a
// waiting one if a day has both).
const VISIT_STATE: Record<AppointmentStatus, WeekDayState | null> = {
  CONFIRMED: "appointment",
  REQUESTED: "requested",
  RESCHEDULED: "requested",
  COMPLETED: "done",
  MISSED: "missed",
  CANCELLED: null,
};
const STATE_RANK: WeekDayState[] = ["appointment", "requested", "done", "missed", "none"];

/** This week, Sunday to Saturday, with today and her visit days marked. */
function weekDays(t: Dictionary, today: string, intlLocale: string, visits: MyVisit[]): WeekDay[] {
  const narrow = new Intl.DateTimeFormat(intlLocale, { timeZone: "UTC", weekday: "narrow" });
  const full = new Intl.DateTimeFormat(intlLocale, { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
  const todayLabel = t.today.todayShort;
  return weekOf(today).map((iso) => {
    const date = parseISODate(iso)!;
    const isToday = iso === today;
    const onDay = visits.filter((visit) => manilaSlot(visit.at).date === iso);
    const states = onDay.map((visit) => VISIT_STATE[visit.status]).filter((state): state is WeekDayState => state !== null);
    const state = STATE_RANK.find((rank) => states.includes(rank)) ?? "none";
    const dayLabel = isToday ? `${todayLabel}, ${full.format(date)}` : full.format(date);
    const visitLabel = onDay.map((visit) => `${visit.service} ${formatSlotClock(visit.at, intlLocale.startsWith("fil") ? "fil" : "en")}, ${t.myAppointments.statuses[visit.status]}`).join("; ");
    return {
      key: iso,
      weekday: isToday ? todayLabel : narrow.format(date),
      day: date.getUTCDate(),
      isToday,
      state,
      label: visitLabel ? `${dayLabel}: ${visitLabel}` : dayLabel,
    };
  });
}

function History({ t, locale, data }: { t: Dictionary; locale: Locale; data: MyToday }) {
  if (data.past.length === 0) return null;
  return (
    <Panel icon={RecordsIcon} tone="beige" title={t.today.history}>
      <ul className="divide-y divide-line">
        {data.past.map((pregnancy) => (
          <li key={pregnancy.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <span className="font-medium">{t.today.outcomes[pregnancy.outcome ?? "OTHER"]}</span>
            <span className="tnum text-ink-soft">{pregnancy.outcomeDate ? formatDate(pregnancy.outcomeDate, locale) : "—"}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function NoPregnancy({ t, locale }: { t: Dictionary; locale: Locale }) {
  const d = t.today;
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[var(--shadow-raised)] sm:p-8">
      <IconCircle icon={PregnancyIcon} tone="blush" size="lg" />
      <h2 className="mt-5 text-xl font-bold">{d.noPregnancy}</h2>
      <p className="mt-2 max-w-[52ch] text-ink-soft">{d.noPregnancyBody}</p>
      <div className="mt-6 rounded-2xl bg-milk p-5">
        <p className="mb-3 flex items-center gap-2 font-semibold">
          <HealthCenterIcon aria-hidden className="size-5 text-leaf" />
          {d.center}
        </p>
        <CenterDetails t={t} locale={locale} />
      </div>
      <Link href="/mother/appointments" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-leaf underline decoration-1 underline-offset-4">
        {t.shell.nav.appointments}
        <CaretRightIcon weight="bold" aria-hidden className="size-4" />
      </Link>
    </section>
  );
}

function Panel({
  id,
  icon,
  tone,
  title,
  className,
  children,
}: {
  id?: string;
  icon: Icon;
  tone: "mint" | "blush" | "beige";
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("scroll-mt-24 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7", className)}>
      <div className="mb-4 flex items-center gap-3">
        <IconCircle icon={icon} tone={tone === "blush" ? "white" : tone} size="sm" className={tone === "blush" ? "text-rose-deep" : undefined} />
        <h2 id={id ? `${id}-title` : undefined} className="text-lg font-bold">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
