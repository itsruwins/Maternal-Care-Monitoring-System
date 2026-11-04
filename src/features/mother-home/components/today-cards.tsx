import Link from "next/link";
import {
  AppointmentIcon,
  BabyMovesIcon,
  BleedingIcon,
  CallIcon,
  CaretRightIcon,
  CheckupIcon,
  ClockIcon,
  DangerIcon,
  FeverIcon,
  HeadacheIcon,
  HealthCenterIcon,
  InfoIcon,
  LocationIcon,
  PhoneIcon,
  PlusIcon,
  PregnancyIcon,
  SwellingIcon,
  WaterBreakIcon,
  WellbeingIcon,
  type Icon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { isPlaceholder, SITE } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { VisitDateTile, VisitStatusTag } from "@/features/mother-appointments/components/visit-status";
import { formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import { parseISODate, type Trimester } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { trimesterFill, trimesterRanges } from "../pregnancy-guide";
import type { MyLastVisit, MyVisit } from "../types";

// The right column of the mother's Today screen, in reading order: her
// checkups (next + last), how far along she is, this week's tip, danger signs
// and the health center. Plain words, big numbers, one action per card.

const CARD = "scroll-mt-24 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7";

function CardHeader({ id, icon, tone, title }: { id: string; icon: Icon; tone: "leaf" | "mint" | "blush" | "fern" | "white"; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconCircle icon={icon} tone={tone} size="sm" className={tone === "white" ? "text-rose-deep" : undefined} />
      <h2 id={id} className="min-w-0 flex-1 text-lg font-bold text-balance">
        {title}
      </h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkups: her next visit (the one thing she can act on), then her last one.

export function CheckupsCard({
  t,
  locale,
  next,
  last,
  canRequest,
  className,
}: {
  t: Dictionary;
  locale: Locale;
  next: MyVisit | null;
  last: MyLastVisit | null;
  /** False while the missed-visit notice above already offers Request a visit. */
  canRequest: boolean;
  className?: string;
}) {
  const v = t.today.visits;
  const weekday = next
    ? new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "Asia/Manila", weekday: "long" }).format(new Date(next.at))
    : "";
  return (
    <section aria-labelledby="next-visit-title" className={cn(CARD, "shadow-[var(--shadow-raised)]", className)}>
      {/* The date tile (or an icon) on the left; everything else lines up in one column beside it */}
      <div className="flex items-stretch gap-4 sm:gap-5">
        {next ? (
          <VisitDateTile iso={next.at} locale={locale} status={next.status} className="h-auto min-h-[4.75rem]" />
        ) : (
          <IconCircle icon={AppointmentIcon} tone="mint" size="lg" />
        )}
        <div className="min-w-0 flex-1">
          <h2 id="next-visit-title" className="text-[0.95rem] leading-6 font-semibold text-leaf">
            {v.next}
          </h2>
          {next ? (
            <>
              <p className="tnum mt-0.5 text-xl leading-7 font-bold tracking-[-0.01em]">
                {weekday}
                <span aria-hidden className="font-normal text-ink-soft"> · </span>
                <span className="whitespace-nowrap">{formatSlotClock(next.at, locale)}</span>
              </p>
              <p className="mt-0.5 break-words text-ink-soft">{next.service}</p>
            </>
          ) : (
            <>
              <p className="mt-0.5 text-xl leading-7 font-bold text-balance">{v.none}</p>
              {canRequest && <p className="mt-1 max-w-[46ch] text-ink-soft">{v.noneBody}</p>}
            </>
          )}
        </div>
      </div>

      {next ? (
        // Status on the left; the button fills the rest of the row (the whole
        // row when a long status pushes it onto its own line)
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <VisitStatusTag t={t} status={next.status} />
          <Button asChild variant="soft" className="grow">
            <Link href="/mother/appointments">
              {t.myVisits.seeAppointments}
              <CaretRightIcon weight="bold" aria-hidden className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        canRequest && (
          <Button asChild className="mt-6 w-full">
            <Link href="/mother/appointments/new">
              <PlusIcon weight="bold" aria-hidden />
              {t.myVisits.book}
            </Link>
          </Button>
        )
      )}

      <div className="mt-6 border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="flex items-center gap-2 font-semibold">
            <CheckupIcon aria-hidden className="size-5 text-leaf" />
            {v.last}
          </h2>
          {last && (
            <p className="tnum text-sm text-ink-soft">
              <span className="whitespace-nowrap">{formatSlotDate(last.at, locale, "short")}</span>
              <span aria-hidden> · </span>
              <span className="whitespace-nowrap">{format(v.lastWeek, { weeks: last.weeks })}</span>
            </p>
          )}
        </div>
        {/* The two readings always show ("—" until her first checkup), so the
            card keeps the same shape and height either way */}
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <Reading label={v.bp} value={last ? `${last.bpSystolic}/${last.bpDiastolic}` : null} unit="mmHg" empty={t.myVisits.detail.notRecorded} />
          <Reading label={v.weight} value={last ? String(last.weightKg) : null} unit="kg" empty={t.myVisits.detail.notRecorded} />
        </dl>
        {last ? (
          <Link
            href="/mother/visits"
            className="mt-4 -mb-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {v.seeVisits}
            <CaretRightIcon weight="bold" aria-hidden className="size-4" />
          </Link>
        ) : (
          <p className="mt-4 flex min-h-9 items-center gap-2 text-sm text-ink-soft">
            <InfoIcon aria-hidden className="size-4 shrink-0" />
            {v.lastNone}
          </p>
        )}
      </div>
    </section>
  );
}

function Reading({ label, value, unit, empty }: { label: string; value: string | null; unit: string; /** Read out instead of the dash. */ empty: string }) {
  return (
    <div className="rounded-xl bg-milk px-4 py-3">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="tnum mt-0.5 text-xl font-bold">
        {value === null ? (
          <>
            <span aria-hidden className="text-ink-soft">—</span>
            <span className="sr-only">{empty}</span>
          </>
        ) : (
          <>
            {value}
            <span className="ml-1 text-sm font-medium text-ink-soft">{unit}</span>
          </>
        )}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pregnancy bar: three parts (one per trimester) with their dates.

export function ProgressCard({
  t,
  locale,
  lmp,
  edd,
  weeks,
  daysPregnant,
  isPastDue,
}: {
  t: Dictionary;
  locale: Locale;
  lmp: string;
  edd: string | null;
  weeks: number;
  daysPregnant: number;
  isPastDue: boolean;
}) {
  const p = t.today.progress;
  const ranges = trimesterRanges(lmp, edd);
  if (!ranges) return null;
  const fill = trimesterFill(daysPregnant);
  const current: Trimester = isPastDue ? 3 : daysPregnant < 98 ? 1 : daysPregnant < 196 ? 2 : 3;
  const status = isPastDue ? p.pastDue : format(p.ofForty, { weeks });
  const short = new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "UTC", month: "short", day: "numeric" });
  const day = (iso: string) => short.format(parseISODate(iso)!).replace(/\s+/g, " ");

  return (
    <section aria-labelledby="progress-title" className={CARD}>
      <CardHeader id="progress-title" icon={PregnancyIcon} tone="blush" title={p.title} />
      <p className={cn("tnum mt-5 text-xl font-bold tracking-[-0.01em]", isPastDue ? "text-rose-deep" : "text-ink")}>{status}</p>
      {/* Parts sized by their length in weeks: 14, 14, 12 */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={40}
        aria-valuenow={Math.min(weeks, 40)}
        aria-valuetext={status}
        aria-labelledby="progress-title"
        className="mt-3 grid grid-cols-[14fr_14fr_12fr] gap-1.5"
      >
        {fill.map((share, i) => (
          <span key={i} className="h-2.5 overflow-hidden rounded-full bg-mint">
            <span
              className={cn("block h-full origin-left animate-grow-x rounded-full", isPastDue ? "bg-rose-deep" : "bg-leaf")}
              style={{ width: `${share * 100}%`, animationDelay: `${i * 120}ms` }}
            />
          </span>
        ))}
      </div>
      <ol className="mt-3 grid grid-cols-[14fr_14fr_12fr] gap-1.5">
        {ranges.map((range) => {
          const here = range.trimester === current;
          return (
            <li key={range.trimester} aria-current={here ? "step" : undefined} className="min-w-0">
              <span className={cn("block text-sm leading-5 text-pretty", here ? "font-bold text-ink" : "font-medium text-ink-soft")}>
                {t.today.trimesters[range.trimester - 1]}
                {here && <span className="sr-only"> ({p.now})</span>}
              </span>
              <span className="tnum mt-0.5 block text-[0.8125rem] leading-5 text-ink-soft">
                {format(p.range, { from: day(range.from), to: day(range.to) })}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
// This week's tip.

export function TipCard({ t, tip, className }: { t: Dictionary; tip: string; className?: string }) {
  return (
    <section id="tip" aria-labelledby="tip-title" className={cn("scroll-mt-24 rounded-3xl bg-mint/70 p-6 sm:p-7", className)}>
      <CardHeader id="tip-title" icon={WellbeingIcon} tone="fern" title={t.today.tipTitle} />
      <p className="mt-4 max-w-[52ch] text-lg leading-7 text-pretty">{tip}</p>
      <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
        <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
        {t.today.tipNote}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Danger signs: an icon and a few words each, then what to do.

const DANGER_ICONS: Icon[] = [BleedingIcon, HeadacheIcon, SwellingIcon, FeverIcon, BabyMovesIcon, WaterBreakIcon];

export function DangerCard({ t, wide = false }: { t: Dictionary; /** Full page width: the signs in 2–3 columns. */ wide?: boolean }) {
  const d = t.today;
  const phone = SITE.healthCenter.contactNumber;
  return (
    <section id="danger" aria-labelledby="danger-title" className="scroll-mt-24 rounded-3xl bg-blush/70 p-6 sm:p-7">
      <CardHeader id="danger-title" icon={DangerIcon} tone="white" title={d.dangerTitle} />
      {/* Each sign in one or two lines; side by side only when the card spans the page */}
      <ul className={cn("mt-5 grid gap-x-6 gap-y-3", wide && "sm:grid-cols-2 lg:grid-cols-3")}>
        {d.dangerSigns.map((sign, i) => {
          const SignIcon = DANGER_ICONS[i] ?? DangerIcon;
          return (
            <li key={sign} className="flex items-center gap-3">
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-rose-deep shadow-[var(--shadow-soft)]">
                <SignIcon weight="fill" className="size-5" />
              </span>
              <span className="min-w-0 text-[0.95rem] leading-5 font-semibold text-pretty">{sign}</span>
            </li>
          );
        })}
      </ul>
      <p className={cn("mt-6 rounded-2xl bg-white/80 px-4 py-3 font-semibold text-pretty text-rose-deep", wide && "lg:w-fit")}>{d.dangerAction}</p>
      {!isPlaceholder(phone) && (
        <Button asChild variant="destructive" className="mt-4 w-full sm:w-auto">
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
            <CallIcon weight="fill" aria-hidden />
            {d.callCenter}
          </a>
        </Button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Health center: where and when (also used on the no-pregnancy screen).

export function CenterDetails({ t, locale }: { t: Dictionary; locale: Locale }) {
  const d = t.today;
  const center = SITE.healthCenter;
  const rows: [Icon, string, string][] = [
    [LocationIcon, d.address, center.address],
    [ClockIcon, d.hours, center.clinicHours[locale]],
    [PhoneIcon, d.contact, isPlaceholder(center.contactNumber) ? t.common.tbd : center.contactNumber],
  ];
  return (
    <dl className="grid gap-x-4 gap-y-1 text-[0.95rem] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-y-2.5">
      {rows.map(([RowIcon, label, value]) => (
        <div key={label} className="contents">
          <dt className="flex items-center gap-2 text-ink-soft">
            <RowIcon aria-hidden className="size-4" />
            {label}
          </dt>
          <dd className="mb-2 min-w-0 font-medium break-words sm:mb-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HealthCenterCard({ t, locale, className }: { t: Dictionary; locale: Locale; className?: string }) {
  return (
    <section aria-labelledby="center-title" className={cn(CARD, className)}>
      <CardHeader id="center-title" icon={HealthCenterIcon} tone="mint" title={t.today.center} />
      <div className="mt-5">
        <CenterDetails t={t} locale={locale} />
      </div>
    </section>
  );
}
