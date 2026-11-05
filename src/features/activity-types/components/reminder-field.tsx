"use client";

import { useState } from "react";
import { DangerIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";
import { MAX_REMINDER_DAYS } from "../constants";

/** The usual choices, one tap each; anything else up to 30 by the stepper or by typing. */
const QUICK = [0, 1, 2, 3] as const;

// The SMS reminder's days before the appointment: quick chips, then − / +
// around the number itself (still a real, typeable number field that the
// form submits), and a sentence saying when mothers get the text.
export function ReminderField({ id, defaultValue, error }: { id: string; defaultValue: number; error: string | null }) {
  const { t } = useDictionary();
  const d = t.activityTypes.dialog;
  const [raw, setRaw] = useState(String(defaultValue));
  const days = /^\d{1,2}$/.test(raw.trim()) ? Number(raw.trim()) : null;
  const valid = days !== null && days <= MAX_REMINDER_DAYS;
  const set = (value: number) => setRaw(String(Math.min(MAX_REMINDER_DAYS, Math.max(0, value))));
  const noteId = `${id}-note`;

  const sentence = !valid ? d.reminderHint : days === 0 ? d.sentenceSameDay : days === 1 ? d.sentenceOneDay : format(d.sentenceDays, { days });

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{d.reminder}</Label>
      <div role="group" aria-label={d.reminderQuick} className="flex flex-wrap gap-1.5">
        {QUICK.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={days === value}
            onClick={() => set(value)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-medium whitespace-nowrap text-ink-soft transition-colors select-none",
              "hover:border-sage hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
              "aria-pressed:border-leaf aria-pressed:bg-mint aria-pressed:font-semibold aria-pressed:text-leaf",
            )}
          >
            {value === 0 ? d.chipSameDay : value === 1 ? d.chipOneDay : format(d.chipDays, { days: value })}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" aria-label={d.fewer} aria-controls={id} disabled={days === 0} onClick={() => set((days ?? 1) - 1)}>
          <MinusIcon weight="bold" aria-hidden />
        </Button>
        <Input
          id={id}
          name="reminderDaysBefore"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_REMINDER_DAYS}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={noteId}
          className="tnum w-20 [appearance:textfield] text-center text-lg font-semibold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={d.more}
          aria-controls={id}
          disabled={days !== null && days >= MAX_REMINDER_DAYS}
          onClick={() => set((days ?? -1) + 1)}
        >
          <PlusIcon weight="bold" aria-hidden />
        </Button>
        <span className="ml-1 text-[0.95rem] text-ink-soft">{days === 1 ? d.daysUnitOne : d.daysUnit}</span>
      </div>
      {error ? (
        <p id={noteId} className="flex items-start gap-1.5 text-sm text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : (
        <p id={noteId} aria-live="polite" className="text-sm text-ink-soft">
          {sentence}
        </p>
      )}
    </div>
  );
}
