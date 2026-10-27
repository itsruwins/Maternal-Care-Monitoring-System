"use client";

import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { parseISODate, toISODate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";

export type DayState = "open" | "full" | "closed" | "out";

// A month grid for picking a visit day. Only "open" days can be chosen; the
// others are shown faded (full, closed or outside the booking window).
// Months can be paged within the window.
export function MonthCalendar({
  first,
  last,
  stateOf,
  selected,
  onSelect,
  locale,
  labels,
}: {
  first: string;
  last: string;
  stateOf: (date: string) => DayState;
  selected: string | null;
  onSelect: (date: string) => void;
  locale: string;
  labels: { prev: string; next: string; closed: string };
}) {
  const tag = locale === "fil" ? "fil-PH" : "en-PH";
  const firstMonth = monthStart(first);
  const lastMonth = monthStart(last);
  const [month, setMonth] = useState(selected ? monthStart(selected) : firstMonth);

  const start = parseISODate(month)!;
  const daysInMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  const leading = start.getUTCDay();
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), i + 1)))),
  ];
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "narrow" }).format(new Date(Date.UTC(2023, 0, 1 + i))),
  );
  const fullDate = new Intl.DateTimeFormat(tag, { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
  const title = new Intl.DateTimeFormat(tag, { timeZone: "UTC", month: "long", year: "numeric" }).format(start);
  const shift = (by: number) => setMonth(toISODate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + by, 1))));

  return (
    <div className="rounded-2xl border border-line p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={month <= firstMonth}
          aria-label={labels.prev}
          className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <CaretLeftIcon weight="bold" aria-hidden className="size-5" />
        </button>
        <p className="font-semibold" aria-live="polite">
          {title}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={month >= lastMonth}
          aria-label={labels.next}
          className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <CaretRightIcon weight="bold" aria-hidden className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, i) => (
          <span key={i} aria-hidden className="pb-1 text-caption font-semibold text-ink-soft">
            {day}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const state = stateOf(date);
          const isSelected = date === selected;
          const day = Number(date.slice(8));
          return (
            <button
              key={date}
              type="button"
              disabled={state !== "open"}
              aria-pressed={isSelected}
              aria-label={state === "closed" ? `${fullDate.format(parseISODate(date)!)}, ${labels.closed}` : fullDate.format(parseISODate(date)!)}
              onClick={() => onSelect(date)}
              className={cn(
                "tnum mx-auto grid size-10 place-items-center rounded-full text-[0.95rem] transition-colors sm:size-11",
                state === "open" && !isSelected && "font-semibold text-ink hover:bg-mint",
                state === "open" && isSelected && "bg-leaf font-semibold text-white shadow-[var(--shadow-soft)]",
                state === "closed" && "text-rose-deep/45 line-through",
                (state === "full" || state === "out") && "text-ink-soft/40",
              )}
            >
              {day}
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
