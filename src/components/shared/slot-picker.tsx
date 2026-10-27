"use client";

import { useMemo, type ReactNode } from "react";
import { useDictionary } from "@/i18n/dictionary-provider";
import { formatSlotTime, isWeekday, SLOT_TIMES, slotKey } from "@/lib/appointments/slots";
import { formatDate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { MonthCalendar, type DayState } from "./month-calendar";

// Day + time picker for appointment slots (mothers requesting, staff booking
// or offering another time). Weekends, closed days, full days and days outside
// [first, last] can't be picked; taken times are shown crossed out. The
// database checks everything again on save.
export function SlotPicker({
  first,
  last,
  closedDays,
  taken,
  date,
  time,
  onDate,
  onTime,
  dayHeading,
  timeHeading,
  variant = "cards",
  idPrefix = "slot",
}: {
  first: string;
  last: string;
  closedDays: string[];
  /** Taken slots as "YYYY-MM-DDTHH:MM" (Manila). */
  taken: string[];
  date: string | null;
  time: string | null;
  onDate: (date: string) => void;
  onTime: (time: string) => void;
  dayHeading: string;
  timeHeading: string;
  /** "cards": two white cards (pages); "plain": stacked, no cards (dialogs). */
  variant?: "cards" | "plain";
  idPrefix?: string;
}) {
  const { t, locale } = useDictionary();
  const p = t.slotPicker;
  const takenSet = useMemo(() => new Set(taken), [taken]);
  const closedSet = useMemo(() => new Set(closedDays), [closedDays]);
  const stateOf = (day: string): DayState => {
    if (day < first || day > last || !isWeekday(day)) return "out";
    if (closedSet.has(day)) return "closed";
    return SLOT_TIMES.every((slot) => takenSet.has(slotKey(day, slot))) ? "full" : "open";
  };
  const openTimes = date ? SLOT_TIMES.filter((slot) => !takenSet.has(slotKey(date, slot))) : [];

  const dayPart = (
    <>
      <MonthCalendar
        first={first}
        last={last}
        stateOf={stateOf}
        selected={date}
        onSelect={onDate}
        locale={locale}
        labels={{ prev: p.prevMonth, next: p.nextMonth, closed: p.closedDay }}
      />
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-ink" />
          {p.legendOpen}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-ink-soft/30" />
          {p.legendFull}
        </span>
      </p>
    </>
  );

  const timePart = !date ? (
    <p className="text-ink-soft">{p.pickDateFirst}</p>
  ) : openTimes.length === 0 ? (
    <p className="text-ink-soft">{p.noTimes}</p>
  ) : (
    <>
      <p className="mb-3 font-medium">{formatDate(date, locale)}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {SLOT_TIMES.map((slot) => {
          const isTaken = takenSet.has(slotKey(date, slot));
          const checked = slot === time;
          return (
            <label
              key={slot}
              className={cn(
                "tnum relative flex h-12 items-center justify-center rounded-full border text-[0.95rem] font-semibold transition-colors",
                isTaken && "cursor-not-allowed border-transparent bg-cream text-ink-soft/50 line-through",
                !isTaken && !checked && "cursor-pointer border-field text-ink hover:border-leaf hover:bg-mint/40",
                checked && "border-leaf bg-leaf text-white",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf",
              )}
            >
              <input type="radio" name={`${idPrefix}-time`} value={slot} checked={checked} disabled={isTaken} onChange={() => onTime(slot)} className="sr-only" />
              {formatSlotTime(slot, locale)}
              {isTaken && <span className="sr-only"> ({p.taken})</span>}
            </label>
          );
        })}
      </div>
    </>
  );

  if (variant === "plain") {
    return (
      <div className="flex flex-col gap-5">
        <Part id={`${idPrefix}-day`} heading={dayHeading} plain>
          {dayPart}
        </Part>
        <Part id={`${idPrefix}-time`} heading={timeHeading} plain fieldset>
          {timePart}
        </Part>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Part id={`${idPrefix}-day`} heading={dayHeading}>
        {dayPart}
      </Part>
      <Part id={`${idPrefix}-time`} heading={timeHeading} fieldset>
        {timePart}
      </Part>
    </div>
  );
}

function Part({ id, heading, plain, fieldset, children }: { id: string; heading: string; plain?: boolean; fieldset?: boolean; children: ReactNode }) {
  const className = plain ? "" : "rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7";
  const title = <p className={cn("mb-4 font-bold", plain ? "text-base" : "text-lg")}>{heading}</p>;
  return fieldset ? (
    <fieldset className={className}>
      <legend className="sr-only">{heading}</legend>
      <div aria-hidden>{title}</div>
      {children}
    </fieldset>
  ) : (
    <section aria-labelledby={id} className={className}>
      <div id={id}>{title}</div>
      {children}
    </section>
  );
}
