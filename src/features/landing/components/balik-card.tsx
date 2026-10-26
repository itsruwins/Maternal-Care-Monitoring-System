"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/ui/stamp";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import {
  addDays,
  dueDateFromLmp,
  formatDate,
  gestationalAge,
  isPlausibleLmp,
} from "@/lib/utils/pregnancy";
import { useToday } from "@/lib/utils/use-today";
import { cn } from "@/lib/utils/cn";

// The hero: the health center's prenatal appointment card. Typing the last
// period date "writes" the due date and current week onto the card and stamps
// the SMS reminder slot. Estimates only; the midwife confirms.
export function BalikCard() {
  const { t, locale } = useDictionary();
  const today = useToday();
  const [lmp, setLmp] = useState("");
  const lmpId = useId();
  const hintId = useId();

  const valid = lmp !== "" && today !== "" && isPlausibleLmp(lmp, today);
  const invalid = lmp !== "" && today !== "" && !valid;
  const due = valid ? dueDateFromLmp(lmp) : null;
  const age = valid ? gestationalAge(lmp, today) : null;
  const registerHref = valid ? `/register?lmp=${lmp}` : "/register";

  return (
    <section aria-labelledby="hero-title" className="px-4 pt-3 pb-16 sm:px-6 sm:pt-4 lg:pt-8 lg:pb-20">
      <div className="mx-auto max-w-6xl">
        {/* Card tab */}
        <div className="card-stock label-print ml-5 inline-flex max-w-[calc(100%-2.5rem)] items-center rounded-t-lg border border-b-0 border-rule px-4 pt-2.5 pb-2 text-[0.66rem] sm:ml-8 sm:text-[0.7rem]">
          <span className="min-[420px]:hidden">{t.landing.cardTabShort}</span>
          <span className="hidden min-[420px]:inline">{t.landing.cardTab}</span>
        </div>

        <article className="card-stock relative grid overflow-hidden rounded-lg rounded-tl-none border border-rule shadow-[var(--shadow-card-lifted)] lg:grid-cols-[1.08fr_1fr]">
          {/* Printed header side */}
          <div className="relative flex flex-col gap-4 px-6 pt-9 pb-6 sm:gap-5 sm:px-10 sm:pt-12 sm:pb-8 lg:px-12 lg:pt-16 lg:pb-12">
            {/* Punched hole and the issuer's seal, printed on the card */}
            <span
              className="absolute top-4 left-4 size-4 rounded-full bg-folder shadow-[inset_0_1px_2px_rgb(31_45_39/0.35)] lg:top-6 lg:left-6"
              aria-hidden
            />
            <Image
              src="/brand/seal-96.png"
              alt=""
              width={48}
              height={48}
              className="absolute top-4 right-4 size-10 rounded-full opacity-90 ring-1 ring-rule sm:top-6 sm:right-6 sm:size-12"
            />
            <h1 id="hero-title" className="display-print max-w-[12ch] text-[clamp(2.5rem,7.2vw,4.75rem)] leading-[0.95]">
              {t.landing.headline}
            </h1>
            <p className="max-w-[38ch] text-base leading-relaxed text-ink/85 sm:text-[1.075rem]">{t.landing.lead}</p>
          </div>

          {/* The card's ruled rows: a working estimate */}
          <div className="border-t border-dashed border-rule bg-paper/50 lg:border-t-0 lg:border-l">
            <div className="flex flex-col px-6 sm:px-10 lg:px-10">
              <div className="flex flex-col justify-center gap-2 border-b border-rule pt-5 pb-3 sm:pt-6">
                <label htmlFor={lmpId} className="label-print text-[0.75rem]">
                  {t.landing.lmpLabel}
                </label>
                <input
                  id={lmpId}
                  type="date"
                  value={lmp}
                  min={today ? (addDays(today, -44 * 7) ?? undefined) : undefined}
                  max={today || undefined}
                  onChange={(e) => setLmp(e.target.value)}
                  aria-describedby={hintId}
                  aria-invalid={invalid}
                  className="tnum hand h-11 w-full max-w-64 rounded-none border border-rule border-b-2 border-b-ink-label bg-paper px-3 text-xl text-ink outline-none focus-visible:border-b-press focus-visible:shadow-[0_2px_0_var(--color-press)] aria-invalid:border-b-brick"
                />
                <p id={hintId} className={cn("text-sm", invalid ? "text-brick" : "text-ink-label")}>
                  {invalid ? t.landing.lmpInvalid : t.landing.lmpHint}
                </p>
              </div>
              
              <CardRow label={t.landing.dueLabel}>
                {due ? (
                  <Written key={due} className="text-[1.65rem] font-bold text-ink">
                    {formatDate(due, locale)}
                  </Written>
                ) : (
                  <Blank />
                )}
              </CardRow>

              <CardRow label={t.landing.weekLabel}>
                {age ? (
                  <Written key={`${age.weeks}-${age.days}`} className="text-xl text-ink-label">
                    {format(t.landing.weekValue, { weeks: age.weeks, days: age.days })}
                  </Written>
                ) : (
                  <Blank />
                )}
              </CardRow>

              <CardRow label={t.landing.nextLabel}>
                <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
                  <span className="hand text-lg text-ink-label">{t.landing.nextValue}</span>
                  {valid && (
                    <Stamp key={lmp} tone="upcoming" tilt={-7} animate>
                      {t.landing.smsStamp}
                    </Stamp>
                  )}
                </div>
              </CardRow>
            </div>
            <p className="px-6 pt-3 pb-5 text-[0.8rem] text-ink-label sm:px-10 sm:pb-6">{t.landing.estimateNote}</p>
          </div>

          {/* Card foot: the actions */}
          <footer className="col-span-full flex flex-col gap-3 border-t border-rule bg-folder/45 px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-12">
            <p className="order-last text-sm text-ink-label lg:order-first">{t.landing.noEmail}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={registerHref}>
                  {t.landing.signup}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <LoginDialog>
                <Button variant="outline" size="lg">
                  {t.landing.login}
                </Button>
              </LoginDialog>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}

function CardRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[3.75rem] items-center justify-between gap-4 border-b border-rule py-2 last:border-b-0 sm:min-h-[4.5rem]">
      <span className="label-print shrink-0 text-[0.75rem]">{label}</span>
      <div className="flex min-w-0 justify-end text-right">{children}</div>
    </div>
  );
}

// A value written onto the card, left to right.
function Written({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("hand tnum inline-block animate-write", className)}>{children}</span>;
}

function Blank() {
  return <span className="block h-px w-28 bg-ink-label/50" aria-hidden />;
}
