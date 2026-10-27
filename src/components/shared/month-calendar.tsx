"use client";

import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { parseISODate, toISODate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";

export type DayState = "open" | "full" | "closed" | "out";

// A month grid for picking a visit day (opened from the day strip's "See full
// month"). Open days carry a small dot; the chosen day is a filled pill;
// today is ringed; everything else is quiet and can't be picked.
export function MonthCalendar({
  first,
  last,
  today,
  stateOf,
  selected,
  onSelect,
  locale,
  labels,
}: {
  first: string;
  last: string;
  /** Ringed when shown (optional). */
  today?: string;
  stateOf: (date: string) => DayState;
  selected: string | null;
  onSelect: (date: string) => void;
  locale: string;
  labels: { prev: string; next: string; closed: string; full: string };
}) {
  const tag = locale === "fil" ? "fil-PH" : "en-PH";
  const firstMonth = monthStart(first);
  const lastMonth = monthStart(last);
  const [month, setMonth] = useState(selected ? monthStart(selected) : firstMonth);

  const start = parseISODate(month)!;
  const daysInMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: start.getUTCDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), i + 1)))),
  ];
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "short" }).format(new Date(Date.UTC(2023, 0, 1 + i))),
  );
  const fullDate = new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
  const title = new Intl.DateTimeFormat(tag, { timeZone: "UTC", month: "long", year: "numeric" }).format(start);
  const shift = (by: number) => setMonth(toISODate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + by, 1))));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={month <= firstMonth}
          aria-label={labels.prev}
          className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <CaretLeftIcon weight="bold" aria-hidden className="size-5" />
        </button>
        <p className="text-lg font-bold" aria-live="polite">
          {title}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={month >= lastMonth}
          aria-label={labels.next}
          className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <CaretRightIcon weight="bold" aria-hidden className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {weekdays.map((day, i) => (
          <span key={i} aria-hidden className="pb-2 text-caption font-medium text-ink-soft">
            {day}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const state = stateOf(date);
          const isSelected = date === selected;
          const label = fullDate.format(parseISODate(date)!);
          return (
            <button
              key={date}
              type="button"
              disabled={state !== "open"}
              aria-pressed={isSelected}
              aria-label={state === "closed" ? `${label}, ${labels.closed}` : state === "full" ? `${label}, ${labels.full}` : label}
              onClick={() => onSelect(date)}
              className={cn(
                "tnum relative mx-auto flex size-12 flex-col items-center justify-center rounded-full text-base transition-colors",
                state === "open" && !isSelected && "font-semibold text-ink hover:bg-mint",
                isSelected && "bg-leaf font-bold text-white shadow-[var(--shadow-soft)]",
                state === "closed" && "text-rose-deep/50 line-through decoration-1",
                (state === "full" || state === "out") && "text-ink-soft/35",
                date === today && !isSelected && "ring-2 ring-line ring-inset",
              )}
            >
              {Number(date.slice(8))}
              {state === "open" && !isSelected && <span aria-hidden className="absolute bottom-1.5 size-1 rounded-full bg-fern" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function monthStart(date: string): string {
  return `${date.slice(0, 7)}-01`;
}
