import type { ReactNode } from "react";
import Link from "next/link";
import {
  AppointmentIcon,
  CaretRightIcon,
  DangerIcon,
  HealthCenterIcon,
  LocationIcon,
  PhoneIcon,
  PregnancyIcon,
  RecordsIcon,
  WellbeingIcon,
  type Icon,
} from "@/components/icons";
import { CurvedHero } from "@/components/ui/curved-hero";
import { IconCircle } from "@/components/ui/icon-circle";
import { InsightCard } from "@/components/ui/insight-card";
import { WeekStrip, type WeekDay } from "@/components/ui/week-strip";
import { isPlaceholder, SITE } from "@/config/site";
import { TrimesterPicture } from "@/features/mothers/components/trimester-picture";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { addDays, daysBetween, formatDate, gestationalAge, parseISODate, PREGNANCY_DAYS, trimesterFromWeeks, weekOf } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { getMyToday } from "../queries/get-my-today";
import type { MyToday } from "../types";

// The mother's home ("Today"), after Flo's pregnancy screen: this week's
// dates, a soft hero with her baby's picture and week, insight cards, then the
// tip of the week, danger signs and her past pregnancies. Two columns on
// desktop. Reads the session: render inside <Suspense>.
export async function TodayScreen() {
  const user = await requireRole(AREA_ROLES.mother);
  const [{ t, locale }, today] = await Promise.all([getServerI18n(), getMyToday(user)]);
  return <TodayView t={t} locale={locale} data={today} today={manilaTodayISO()} />;
}

// The page layout, without data loading (also used by the dev preview).
export function TodayView({ t, locale, data, today }: { t: Dictionary; locale: Locale; data: MyToday; today: string }) {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-ink-soft">{longDate.format(todayDate)}</p>
        <h1 className="text-title mt-1 font-extrabold">{format(d.greeting, { name: data.firstName })}</h1>
      </div>

      {current && age ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
          {/* Left: the hero */}
          <CurvedHero tone="rose" curve="lg" className="rounded-t-3xl px-4 pt-5 pb-14 sm:px-8 lg:sticky lg:top-24">
            <h2 className="sr-only">{d.weekLabel}</h2>
            <WeekStrip days={weekDays(today, intlLocale, d.todayShort)} aria-label={d.weekLabel} className="mx-auto max-w-md" />
            <div className="mt-8 flex flex-col items-center text-center">
              {trimester && (
                <TrimesterPicture
                  trimester={trimester}
                  priority
                  className="size-48 shadow-[0_18px_40px_-18px_rgb(156_79_74/0.45)] ring-8 ring-white/60 sm:size-56"
                />
              )}
              <p className="tnum mt-6 text-[2.75rem] leading-none font-extrabold tracking-[-0.03em] sm:text-[3.25rem]">
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

          {/* Right: cards, tip, danger signs, history */}
          <div className="flex flex-col gap-6">
            <Insights t={t} weeks={age.weeks} />
            <TipCard t={t} weeks={age.weeks} />
            <DangerCard t={t} />
            <History t={t} locale={locale} data={data} />
          </div>
        </div>
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

/** This week, Sunday to Saturday, with today marked. Appointment days come in Phase 4. */
function weekDays(today: string, intlLocale: string, todayLabel: string): WeekDay[] {
  const narrow = new Intl.DateTimeFormat(intlLocale, { timeZone: "UTC", weekday: "narrow" });
  const full = new Intl.DateTimeFormat(intlLocale, { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
  return weekOf(today).map((iso) => {
    const date = parseISODate(iso)!;
    const isToday = iso === today;
    return {
      key: iso,
      weekday: isToday ? todayLabel : narrow.format(date),
      day: date.getUTCDate(),
      isToday,
      label: isToday ? `${todayLabel}, ${full.format(date)}` : full.format(date),
    };
  });
}

function Insights({ t, weeks }: { t: Dictionary; weeks: number }) {
  const c = t.today.cards;
  const card = (href: string, title: string, tone: "white" | "mint" | "blush", visual: ReactNode, body?: string) => (
    <Link href={href} className="block rounded-xl no-underline outline-offset-4 focus-visible:outline-2 focus-visible:outline-leaf">
      <InsightCard title={title} tone={tone} visual={visual} className="h-40 w-full transition-transform hover:-translate-y-0.5">
        {body && <p className="text-sm text-ink-soft">{body}</p>}
      </InsightCard>
    </Link>
  );
  return (
    <div className="grid grid-cols-3 gap-3">
      {card("/mother/appointments", c.nextVisit, "white", <IconCircle icon={AppointmentIcon} tone="leaf" size="sm" />, c.nextVisitNone)}
      {card("#tip", c.tip, "mint", <IconCircle icon={WellbeingIcon} tone="fern" size="sm" />, format(t.today.week, { weeks }))}
      {card("#danger", c.danger, "blush", <IconCircle icon={DangerIcon} tone="white" size="sm" className="text-rose-deep" />)}
    </div>
  );
}

function TipCard({ t, weeks }: { t: Dictionary; weeks: number }) {
  const tips = t.today.tips;
  return (
    <Panel id="tip" icon={WellbeingIcon} tone="mint" title={format(t.today.tipTitle, { weeks })}>
      <p className="text-lg leading-7">{tips[weeks % tips.length]}</p>
      <p className="mt-3 text-sm text-ink-soft">{t.today.tipNote}</p>
    </Panel>
  );
}

function DangerCard({ t }: { t: Dictionary }) {
  return (
    <Panel id="danger" icon={DangerIcon} tone="blush" title={t.today.dangerTitle} className="bg-blush/60">
      <ul className="flex flex-col gap-2.5">
        {t.landing.tips.danger.map((sign) => (
          <li key={sign} className="flex items-start gap-2.5 text-[0.95rem] leading-6">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-rose-deep" />
            {sign}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold text-rose-deep">{t.today.dangerAction}</p>
    </Panel>
  );
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
  const center = SITE.healthCenter;
  const rows: [Icon, string, string][] = [
    [LocationIcon, d.address, center.address],
    [AppointmentIcon, d.hours, center.clinicHours[locale]],
    [PhoneIcon, d.contact, isPlaceholder(center.contactNumber) ? t.common.tbd : center.contactNumber],
  ];
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[var(--shadow-raised)] sm:p-8">
      <IconCircle icon={PregnancyIcon} tone="blush" size="lg" />
      <h2 className="mt-5 text-xl font-bold">{d.noPregnancy}</h2>
      <p className="mt-2 max-w-[52ch] text-ink-soft">{d.noPregnancyBody}</p>
      <div className="mt-6 rounded-2xl bg-milk p-5">
        <p className="flex items-center gap-2 font-semibold">
          <HealthCenterIcon aria-hidden className="size-5 text-leaf" />
          {d.center}
        </p>
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.95rem]">
          {rows.map(([RowIcon, label, value]) => (
            <div key={label} className="contents">
              <dt className="flex items-center gap-2 text-ink-soft">
                <RowIcon aria-hidden className="size-4" />
                {label}
              </dt>
              <dd className="min-w-0 break-words">{value}</dd>
            </div>
          ))}
        </dl>
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
