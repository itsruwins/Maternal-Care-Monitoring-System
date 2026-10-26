"use client";

import { CheckIcon, HomeIcon, LockIcon, PregnancyIcon, RecordsIcon, UserIcon, type Icon } from "@/components/icons";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";
import { REGISTER_STEPS } from "../schemas";

// One icon per step, in the same order as REGISTER_STEPS.
export const STEP_ICONS: Record<(typeof REGISTER_STEPS)[number]["key"], Icon> = {
  account: LockIcon,
  personal: UserIcon,
  address: HomeIcon,
  pregnancy: PregnancyIcon,
  review: RecordsIcon,
};

// Sign-up progress: a row of icon circles joined by a line that runs behind them. Done steps show a
// check on mint, the current step is filled leaf green, later steps are quiet.
// Labels show from 640px; phones get a "Step 2 of 5 · About you" line instead.
export function RegisterStepper({ current }: { current: number }) {
  const { t } = useDictionary();
  const total = REGISTER_STEPS.length;
  const progress = format(t.register.stepOf, { current: current + 1, total });

  return (
    <div className="px-6 pt-1 pb-5 sm:px-8">
      <p className="mb-3 text-sm font-medium text-ink-soft sm:hidden">
        {progress} · <span className="font-semibold text-ink">{t.register.steps[REGISTER_STEPS[current].key]}</span>
      </p>
      <ol aria-label={progress} className="flex items-start">
        {REGISTER_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const StepIcon = done ? CheckIcon : STEP_ICONS[step.key];
          return (
            <li
              key={step.key}
              aria-current={active ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1.5"
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[1.125rem] right-1/2 z-0 h-0.5 w-full -translate-y-1/2 rounded-full transition-colors duration-300",
                    done || active ? "bg-fern" : "bg-line"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-9 place-items-center rounded-full transition-colors duration-300",
                  active && "bg-leaf text-white shadow-[0_6px_14px_-6px_rgb(62_90_77/0.6)]",
                  done && "bg-mint text-leaf",
                  !active && !done && "bg-cream text-ink-soft"
                )}
              >
                <StepIcon weight={active ? "fill" : done ? "bold" : "regular"} aria-hidden className="size-[1.125rem]" />
              </span>
              <span
                className={cn(
                  "hidden text-caption whitespace-nowrap sm:block",
                  active ? "font-semibold text-ink" : "font-medium text-ink-soft"
                )}
              >
                {t.register.steps[step.key]}
              </span>
              <span className="sr-only">
                {t.register.steps[step.key]}
                {done ? " ✓" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
