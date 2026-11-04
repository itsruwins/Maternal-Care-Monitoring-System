import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  CalendarPlusIcon,
  CallIcon,
  CaretRightIcon,
  CheckupIcon,
  ClockIcon,
  LocationIcon,
  PhoneIcon,
  PregnancyIcon,
  type Icon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/accounts/components/badges";
import { StatusChip } from "@/features/appointments/components/appointment-bits";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { daysBetween, formatDate } from "@/lib/utils/pregnancy";
import { bookForMotherHref, recordVisitForMotherHref } from "../paths";
import type { MotherActivity, MotherRecord, PregnancySummary } from "../types";
import { CopyNumberButton } from "./copy-number-button";
import { MotherInitials } from "./mother-initials";

const CHIP = "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap";

// The top of her record: who she is (initials, name, age, number with a copy
// button, purok, login and how she was registered), then the actions in a row
// under her name (Book appointment and Record visit while she is pregnant, and
// Call; Book takes the full width on phones), so a long name never squeezes. A milk strip of four facts closes the card, each
// opening the tab behind it: pregnancy week over a bar of the 40 weeks, due
// date with how long is left, her next visit and her last one. Past due turns
// the week chip and the countdown rose-deep.
export function RecordHeader({
  t,
  locale,
  mother,
  name,
  age,
  origin,
  pregnancy,
  activity,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  mother: MotherRecord;
  name: string;
  age: number | null;
  origin: string;
  pregnancy: PregnancySummary;
  activity: MotherActivity;
  today: string;
}) {
  const r = t.mothers.record;
  const a = r.actions;
  const pregnant = pregnancy.kind === "active";
  const pastDue = pregnancy.kind === "active" && pregnancy.dueDate !== null && pregnancy.dueDate < today;
  const tel = `tel:${mother.contactNumber.replace(/[^\d+]/g, "")}`;

  return (
    <section aria-labelledby="mother-name" className="overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-5 p-5 sm:p-8">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <MotherInitials name={name} size="lg" />
          <div className="flex min-w-0 flex-col gap-2">
            <h1 id="mother-name" className="text-title font-extrabold tracking-[-0.01em] text-balance break-words">
              {name}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.95rem] text-ink-soft">
              {age !== null && <span>{format(r.age, { age })}</span>}
              <span className="inline-flex items-center gap-1.5">
                <PhoneIcon aria-hidden className="size-4" />
                <span className="tnum">{mother.contactNumber}</span>
                <CopyNumberButton number={mother.contactNumber} labels={{ copy: a.copy, copied: a.copied, failed: a.copyFailed }} />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LocationIcon aria-hidden className="size-4" />
                {mother.purokName ?? t.mothers.noPurokYet}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {pastDue && (
                <span className={cn(CHIP, "bg-rose-deep text-white")}>
                  <ClockIcon weight="bold" aria-hidden className="size-3.5" />
                  {t.mothers.pastDue}
                </span>
              )}
              {mother.login ? (
                <StatusBadge
                  status={mother.login.status}
                  label={`${t.mothers.columns.login}: ${mother.login.status === "ACTIVE" ? r.login.active : r.login.inactive}`}
                />
              ) : (
                <span className={cn(CHIP, "bg-cream text-ink-soft")}>{t.mothers.noLogin}</span>
              )}
              <span className="text-sm text-ink-soft">{origin}</span>
            </div>
          </div>
        </div>

        <div role="group" aria-label={a.label} className="flex flex-wrap items-center gap-2 sm:pl-[5.25rem]">
          {pregnant && (
            <>
              <Button asChild className="max-sm:basis-full">
                <Link href={bookForMotherHref(mother.id)} className="no-underline">
                  <CalendarPlusIcon weight="bold" aria-hidden />
                  {a.book}
                </Link>
              </Button>
              <Button asChild variant="soft" className="max-sm:flex-1">
                <Link href={recordVisitForMotherHref(mother.id)} className="no-underline">
                  <CheckupIcon weight="bold" aria-hidden />
                  {a.visit}
                </Link>
              </Button>
            </>
          )}
          {/* Beside the two buttons Call is a round icon; alone it says who it calls. */}
          {pregnant ? (
            <Button asChild variant="soft" size="icon">
              <a href={tel} aria-label={format(a.call, { name: mother.firstName })} title={format(a.call, { name: mother.firstName })}>
                <CallIcon weight="bold" aria-hidden />
              </a>
            </Button>
          ) : (
            <Button asChild variant="soft">
              <a href={tel} className="no-underline">
                <CallIcon weight="bold" aria-hidden />
                {format(a.call, { name: mother.firstName })}
              </a>
            </Button>
          )}
        </div>
      </div>

      <Facts t={t} locale={locale} pregnancy={pregnancy} activity={activity} today={today} pastDue={pastDue} />
    </section>
  );
}

/** The four facts under her name, each a link to the tab behind it. */
function Facts({
  t,
  locale,
  pregnancy,
  activity,
  today,
  pastDue,
}: {
  t: Dictionary;
  locale: Locale;
  pregnancy: PregnancySummary;
  activity: MotherActivity;
  today: string;
  pastDue: boolean;
}) {
  const r = t.mothers.record;
  const f = r.facts;
  const d = t.dashboard.due;
  const { next, last } = activity;

  // Pregnancy
  let pregnancyValue: ReactNode;
  let pregnancyLine: ReactNode = null;
  if (pregnancy.kind === "active") {
    pregnancyValue =
      pregnancy.weeks !== null ? format(t.mothers.week, { weeks: pregnancy.weeks }) : t.mothers.search.pregnant;
    pregnancyLine =
      pregnancy.weeks !== null ? (
        <span className="flex flex-col gap-2">
          {pregnancy.trimester && <span>{t.mothers.trimesters[pregnancy.trimester - 1]}</span>}
          <span
            role="img"
            aria-label={format(t.mothers.progress, { weeks: pregnancy.weeks })}
            className="block h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-mint"
          >
            <span
              className={cn("block h-full origin-left rounded-full motion-safe:animate-grow-x", pastDue ? "bg-rose-deep" : "bg-leaf")}
              style={{ width: `${Math.min(pregnancy.weeks / 40, 1) * 100}%` }}
            />
          </span>
        </span>
      ) : null;
  } else if (pregnancy.kind === "closed") {
    pregnancyValue = pregnancy.outcome ? t.mothers.outcomes[pregnancy.outcome] : t.mothers.outcomes.OTHER;
    pregnancyLine = pregnancy.outcomeDate ? formatDate(pregnancy.outcomeDate, locale, "short") : null;
  } else {
    pregnancyValue = f.notPregnant;
  }

  // Due date
  let dueValue: ReactNode = <Muted>{f.noDue}</Muted>;
  let dueLine: ReactNode = null;
  if (pregnancy.kind === "active" && pregnancy.dueDate) {
    const days = daysBetween(today, pregnancy.dueDate) ?? 0;
    dueValue = formatDate(pregnancy.dueDate, locale, "short");
    dueLine = (
      <span className={cn(days < 0 && "font-semibold text-rose-deep")}>
        {days < 0 ? (days === -1 ? d.pastDueOne : format(d.pastDue, { days: -days })) : days === 0 ? d.dueToday : days === 1 ? d.tomorrow : format(d.inDays, { days })}
      </span>
    );
  } else if (pregnancy.kind !== "active") {
    dueValue = <Muted>—</Muted>;
  }

  // Next and last visit (date over time and service, kept on their lines).
  const nextValue = next ? formatSlotDate(next.at, locale, "short") : <Muted>{f.noneBooked}</Muted>;
  const nextLine = next ? (
    <span className="flex flex-col items-start gap-1.5">
      <span>{`${formatSlotClock(next.at, locale)} · ${next.service}`}</span>
      {next.status !== "CONFIRMED" && <StatusChip t={t} status={next.status} />}
    </span>
  ) : null;
  const lastValue = last ? formatSlotDate(last.at, locale, "short") : <Muted>{f.noVisits}</Muted>;
  const lastLine = last ? [format(f.atWeek, { weeks: last.weeks }), last.services[0]].filter(Boolean).join(" · ") : null;

  return (
    <dl aria-label={f.label} className="grid grid-cols-2 gap-px border-t border-line bg-line lg:grid-cols-4">
      <Fact href="?tab=pregnancy" icon={PregnancyIcon} label={f.pregnancy} value={pregnancyValue} line={pregnancyLine} alert={pastDue} />
      <Fact href="?tab=pregnancy" icon={CalendarIcon} label={f.due} value={dueValue} line={dueLine} />
      <Fact href="?tab=appointments" icon={CalendarPlusIcon} label={f.next} value={nextValue} line={nextLine} />
      <Fact href="?tab=visits" icon={CheckupIcon} label={f.last} value={lastValue} line={lastLine} />
    </dl>
  );
}

function Fact({
  href,
  icon: Glyph,
  label,
  value,
  line,
  alert = false,
}: {
  href: string;
  icon: Icon;
  label: string;
  value: ReactNode;
  line: ReactNode;
  alert?: boolean;
}) {
  return (
    <div className="group relative flex min-w-0 flex-col gap-1 bg-milk px-5 py-4 transition-colors hover:bg-cream/70 sm:px-8 sm:py-5">
      <dt className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        <Glyph weight="bold" aria-hidden className={cn("size-4", alert ? "text-rose-deep" : "text-leaf")} />
        {label}
      </dt>
      <dd className="flex min-w-0 flex-col gap-1">
        <Link
          href={href}
          scroll={false}
          className={cn(
            "inline-flex items-center gap-1 self-start text-lg leading-snug font-bold break-words no-underline focus-visible:outline-none",
            "after:absolute after:inset-0 after:rounded-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-leaf focus-visible:after:outline-solid",
            alert ? "text-rose-deep" : "text-ink",
          )}
        >
          {value}
          <CaretRightIcon
            weight="bold"
            aria-hidden
            className="size-3.5 text-leaf opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </Link>
        {line && <span className="text-sm text-ink-soft">{line}</span>}
      </dd>
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-ink-soft">{children}</span>;
}
