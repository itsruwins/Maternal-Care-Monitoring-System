"use client";

import { Check } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";
import { REGISTER_STEPS } from "../schemas";

// The card's tab row: one tab per step. Done steps carry a check, the current
// step is in full ink, later steps sit quiet.
export function RegisterStepper({ current }: { current: number }) {
  const { t } = useDictionary();
  const total = REGISTER_STEPS.length;

  return (
    <div className="border-b border-rule bg-folder/50">
      <p className="label-print px-6 pt-4 text-[0.72rem] sm:hidden">
        {format(t.register.stepOf, { current: current + 1, total })} · {t.register.steps[REGISTER_STEPS[current].key]}
      </p>
      <ol className="flex gap-1 px-6 pt-3 pb-0 sm:gap-0 sm:px-4 sm:pt-0" aria-label={format(t.register.stepOf, { current: current + 1, total })}>
        {REGISTER_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step.key}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 sm:px-2 sm:py-3.5",
                "h-1.5 rounded-full sm:h-auto sm:rounded-none sm:border-b-[3px]",
                active && "bg-press sm:border-press sm:bg-transparent",
                done && "bg-sage sm:border-sage sm:bg-transparent",
                !active && !done && "bg-rule sm:border-transparent sm:bg-transparent"
              )}
            >
              <span className={cn("hidden items-center gap-1.5 sm:inline-flex", "label-print text-[0.72rem]", active ? "text-ink" : "text-ink-label")}>
                {done ? <Check className="size-3.5 text-stamp" aria-hidden /> : <span className="tnum">{index + 1}</span>}
                {t.register.steps[step.key]}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="h-3 sm:hidden" />
    </div>
  );
}
