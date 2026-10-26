"use client";

import { useId, useState } from "react";
import { ArrowRightIcon, MinusIcon, PhoneIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { AuthDialogTrigger } from "@/features/auth/components/auth-dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { addDays, parseISODate, trimesterFromWeeks, type Trimester } from "@/lib/utils/pregnancy";
import { useToday } from "@/lib/utils/use-today";
import { HeroVisual, type HeroCardsView } from "./hero-visual";

const MIN_WEEKS = 4;
const MAX_WEEKS = 42;
const START_WEEKS = 24;
const FULL_TERM_WEEKS = 40;

// Where each trimester's label sits under the slider (centre of its weeks).
const TRIMESTER_SPANS: { trimester: Trimester; from: number; to: number }[] = [
  { trimester: 1, from: MIN_WEEKS, to: 13 },
  { trimester: 2, from: 14, to: 27 },
  { trimester: 3, from: 28, to: MAX_WEEKS },
];
const percent = (weeks: number) => ((weeks - MIN_WEEKS) / (MAX_WEEKS - MIN_WEEKS)) * 100;

// The hero: headline and a "how far along are you?" slider (no date typing),
// beside the mother illustration with cards showing what the system does for
// her. Moving the slider updates her trimester, an estimated due month and the
// floating weeks card (estimates only; the midwife confirms).
// Layout: two columns on desktop (text left, picture right); on phones the
// picture sits between the lead and the slider card, so the card it changes stays near.
export function Hero() {
  const { t, locale } = useDictionary();
  const copy = t.landing;
  const est = copy.estimate;
  const today = useToday();
  const [weeks, setWeeks] = useState(START_WEEKS);
  const [touched, setTouched] = useState(false);
  const sliderId = useId();

  const trimester = trimesterFromWeeks(weeks);
  const trimesterName = est.trimesterNames[trimester - 1];
  // Due month: today + the weeks left to 40. Only once the browser knows today.
  const dueIso = today ? addDays(today, (FULL_TERM_WEEKS - weeks) * 7) : null;
  const monthYear = (month: "long" | "short") =>
    dueIso
      ? new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "UTC", month, year: "numeric" }).format(
          parseISODate(dueIso)!,
        )
      : null;
  const dueMonth = monthYear("long");
  const dueMonthShort = monthYear("short");

  const change = (next: number) => {
    setWeeks(Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, next)));
    setTouched(true);
  };

  const view: HeroCardsView = {
    weeks: format(est.weeksValue, { weeks }),
    due: format(copy.heroCards.dueOn, { date: dueMonthShort ?? copy.heroCards.sampleDue }),
    trimester,
    nextVisit: touched ? null : copy.heroCards.sampleNext,
    isEstimate: touched,
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-6xl gap-x-12 px-4 pt-8 pb-4 [grid-template-areas:'text'_'visual'_'estimate'_'actions'] sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:pt-14 lg:[grid-template-areas:'text_visual'_'estimate_visual'_'actions_visual'] lg:[grid-template-rows:auto_auto_1fr]"
    >
      <div className="[grid-area:text]">
        <h1 id="hero-title" className="text-display max-w-[13ch] font-extrabold">
          {copy.headline}
        </h1>
        <p className="mt-4 max-w-[46ch] text-lg leading-7 text-ink-soft">{copy.lead}</p>
      </div>

      <HeroVisual copy={copy.heroCards} view={view} className="mt-10 [grid-area:visual] lg:mt-0 lg:self-center" />

      {/* How far along: drives the floating weeks card */}
      <div className="mt-8 max-w-xl rounded-2xl bg-white p-5 shadow-[var(--shadow-raised)] [grid-area:estimate] sm:p-6 lg:mt-7">
        <label htmlFor={sliderId} className="text-lg leading-6 font-semibold">
          {est.title}
        </label>

        <p aria-hidden className="tnum mt-3 text-center text-[2rem] leading-10 font-extrabold tracking-[-0.02em]">
          {format(est.weeksValue, { weeks })}
        </p>

        <div className="mt-2 flex items-start gap-3">
          <Button
            type="button"
            variant="soft"
            size="icon"
            aria-label={est.decrease}
            disabled={weeks <= MIN_WEEKS}
            onClick={() => change(weeks - 1)}
          >
            <MinusIcon weight="bold" aria-hidden />
          </Button>
          <div className="relative min-w-0 flex-1">
            <input
              id={sliderId}
              type="range"
              min={MIN_WEEKS}
              max={MAX_WEEKS}
              step={1}
              value={weeks}
              onChange={(e) => change(Number(e.target.value))}
              aria-valuetext={format(est.valueText, { weeks, trimester: trimesterName })}
              className="range-soft block"
              style={{ ["--fill" as string]: `${percent(weeks)}%` }}
            />
            {/* trimester labels under the track */}
            <div aria-hidden className="relative h-5">
              {TRIMESTER_SPANS.map((span) => (
                <span
                  key={span.trimester}
                  className={`absolute -translate-x-1/2 text-caption whitespace-nowrap ${
                    span.trimester === trimester ? "font-semibold text-ink" : "font-medium text-ink-soft"
                  }`}
                  style={{ left: `${percent((span.from + span.to) / 2)}%` }}
                >
                  {est.trimesterShort[span.trimester - 1]}
                </span>
              ))}
            </div>
          </div>
          <Button
            type="button"
            variant="soft"
            size="icon"
            aria-label={est.increase}
            disabled={weeks >= MAX_WEEKS}
            onClick={() => change(weeks + 1)}
          >
            <PlusIcon weight="bold" aria-hidden />
          </Button>
        </div>

        <dl aria-live="polite" className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-cream px-3.5 py-3">
            <dt className="text-caption font-medium text-ink-soft">{est.trimesterLabel}</dt>
            <dd className="mt-1 text-[1.0625rem] leading-6 font-bold">{trimesterName}</dd>
          </div>
          <div className="rounded-xl bg-cream px-3.5 py-3">
            <dt className="text-caption font-medium text-ink-soft">{est.dueLabel}</dt>
            <dd className="tnum mt-1 text-[1.0625rem] leading-6 font-bold">{dueMonth ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-ink-soft">{est.note}</p>
      </div>

      {/* Sign up. Log in lives in the header only. */}
      <div className="[grid-area:actions]">
        <AuthDialogTrigger mode="signup">
          <Button size="lg" className="mt-7 w-full sm:w-auto">
            {copy.signup}
            <ArrowRightIcon weight="bold" aria-hidden />
          </Button>
        </AuthDialogTrigger>
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
          <PhoneIcon weight="regular" aria-hidden className="size-[1.125rem] shrink-0" />
          {copy.browserNote} {copy.noEmail}
        </p>
      </div>
    </section>
  );
}
