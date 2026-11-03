"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  CalendarIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CloudSunIcon,
  SunIcon,
  type Icon,
} from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import {
  formatSlotTime,
  isWeekday,
  SLOT_TIMES,
  slotKey,
} from "@/lib/appointments/slots";
import { addDays, formatDate, parseISODate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { MonthCalendar, type DayState } from "./month-calendar";

const MORNING = SLOT_TIMES.filter((slot) => slot < "12:00");
const AFTERNOON = SLOT_TIMES.filter((slot) => slot >= "12:00");

// Day + time picker for appointment slots (mothers requesting, staff booking
// or offering another time). A sideways strip of weekday cards ("5 open",
// "Full", "Closed"), a "See full month" view, then the times grouped Morning /
// Afternoon. The database checks every rule again on save.
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
  today,
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
  /** "cards": white cards (pages); "plain": no cards (dialogs). */
  variant?: "cards" | "plain";
  idPrefix?: string;
  /** Today's date (Manila), ringed in the month view. */
  today?: string;
}) {
  const { t, locale } = useDictionary();
  const p = t.slotPicker;
  const tag = locale === "fil" ? "fil-PH" : "en-PH";
  const takenSet = useMemo(() => new Set(taken), [taken]);
  const closedSet = useMemo(() => new Set(closedDays), [closedDays]);
  const openCount = (day: string) =>
    SLOT_TIMES.filter((slot) => !takenSet.has(slotKey(day, slot))).length;
  const stateOf = (day: string): DayState => {
    if (day < first || day > last || !isWeekday(day)) return "out";
    if (closedSet.has(day)) return "closed";
    return openCount(day) === 0 ? "full" : "open";
  };

  // Weekdays in the window (weekends are always closed, so they're left out).
  const days = useMemo(() => {
    const list: string[] = [];
    for (let day = first; day <= last; day = addDays(day, 1)!)
      if (isWeekday(day)) list.push(day);
    return list;
  }, [first, last]);

  // The row is one Tab stop: Left/Right move between open days, Home/End jump
  // to the first or last. The stop is the day last focused, else the picked
  // day, else the first open day.
  const openDays = days.filter((day) => stateOf(day) === "open");
  const [focusedDay, setFocusedDay] = useState<string | null>(null);
  const tabDay =
    (focusedDay && openDays.includes(focusedDay) ? focusedDay : null) ??
    (date && openDays.includes(date) ? date : null) ??
    openDays[0] ??
    null;
  const onDayKey = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const index = openDays.indexOf(day);
    const next =
      event.key === "ArrowRight"
        ? openDays[index + 1]
        : event.key === "ArrowLeft"
          ? openDays[index - 1]
          : event.key === "Home"
            ? openDays[0]
            : event.key === "End"
              ? openDays[openDays.length - 1]
              : undefined;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (next)
      strip.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${next}"] button`)
        ?.focus();
  };

  const [monthOpen, setMonthOpen] = useState(false);
  const strip = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!date) return;
    strip.current
      ?.querySelector<HTMLElement>(`[data-day="${date}"]`)
      ?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
  }, [date]);
  const scrollBy = (direction: number) =>
    strip.current?.scrollBy({
      left: direction * strip.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  // The header names the month of the first day in view.
  const [visibleDay, setVisibleDay] = useState(date ?? days[0] ?? first);
  const onStripScroll = () => {
    const list = strip.current;
    if (!list) return;
    const firstInView = [
      ...list.querySelectorAll<HTMLElement>("[data-day]"),
    ].find((el) => el.offsetLeft + el.offsetWidth > list.scrollLeft + 8);
    if (
      firstInView?.dataset.day &&
      firstInView.dataset.day.slice(0, 7) !== visibleDay.slice(0, 7)
    )
      setVisibleDay(firstInView.dataset.day);
  };

  const weekday = new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    weekday: "short",
  });
  const monthShort = new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    month: "short",
  });
  const fullDate = new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const monthTitle = new Intl.DateTimeFormat(tag, {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(parseISODate(visibleDay)!);

  const dayPart = (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-ink-soft">{monthTitle}</p>
        <button
          type="button"
          onClick={() => setMonthOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-leaf transition-colors hover:bg-mint"
        >
          <CalendarIcon aria-hidden className="size-4" />
          {p.seeMonth}
        </button>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={p.earlier}
          className="absolute top-1/2 -left-3 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)] hover:bg-cream sm:grid"
        >
          <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        </button>
        <ol
          ref={strip}
          onScroll={onStripScroll}
          aria-label={dayHeading}
          className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:mx-3 [&::-webkit-scrollbar]:hidden"
        >
          {days.map((day, index) => {
            const state = stateOf(day);
            const isSelected = day === date;
            const count = state === "open" ? openCount(day) : 0;
            const newMonth =
              index > 0 && day.slice(5, 7) !== days[index - 1].slice(5, 7);
            const status =
              state === "closed"
                ? p.closedDay
                : state === "full"
                  ? p.full
                  : format(p.openCount, { count });
            return (
              <Fragment key={day}>
                {/* A new month gets a small label between the cards. */}
                {newMonth && (
                  <li aria-hidden className="flex shrink-0 items-center">
                    <span className="rounded-full bg-mint px-2 py-1 text-caption font-semibold text-leaf">
                      {monthShort.format(parseISODate(day)!)}
                    </span>
                  </li>
                )}
                <li data-day={day} className="snap-start">
                  <button
                    type="button"
                    disabled={state !== "open"}
                    aria-pressed={isSelected}
                    // Starts with the visible text ("Fri 6, 12 open") for voice control.
                    aria-label={`${weekday.format(parseISODate(day)!)} ${Number(day.slice(8))}, ${status}, ${fullDate.format(parseISODate(day)!)}`}
                    tabIndex={day === tabDay ? 0 : -1}
                    onFocus={() => setFocusedDay(day)}
                    onKeyDown={(event) => onDayKey(event, day)}
                    onClick={() => onDate(day)}
                    className={cn(
                      "flex h-24 w-[4.75rem] flex-col items-center justify-between rounded-2xl border px-1 py-2.5 transition-colors",
                      isSelected &&
                        "border-leaf bg-leaf text-white shadow-[var(--shadow-soft)]",
                      !isSelected &&
                        state === "open" &&
                        "border-line bg-white text-ink hover:border-leaf hover:bg-mint/40",
                      state !== "open" &&
                        "border-transparent bg-cream/70 text-ink-soft/50",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "text-caption font-medium",
                        isSelected ? "text-white/85" : "text-ink-soft",
                      )}
                    >
                      {weekday.format(parseISODate(day)!)}
                    </span>
                    {/* A space, so the text reads "Fri 6 12 open" (no gap on screen: flex). */}
                    {" "}
                    <span
                      aria-hidden
                      className="tnum text-xl leading-none font-bold"
                    >
                      {Number(day.slice(8))}
                    </span>
                    {" "}
                    <span
                      aria-hidden
                      className={cn(
                        "text-caption leading-none font-semibold whitespace-nowrap",
                        isSelected
                          ? "text-white"
                          : state === "open"
                            ? "text-leaf"
                            : state === "closed"
                              ? "text-rose-deep/70"
                              : "text-ink-soft/60",
                      )}
                    >
                      {status}
                    </span>
                  </button>
                </li>
              </Fragment>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={p.later}
          className="absolute top-1/2 -right-3 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)] hover:bg-cream sm:grid"
        >
          <CaretRightIcon weight="bold" aria-hidden className="size-4" />
        </button>
      </div>

      <Dialog open={monthOpen} onOpenChange={setMonthOpen}>
        <DialogContent closeLabel={t.common.close} className="sm:max-w-md">
          <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
            <DialogTitle>{dayHeading}</DialogTitle>
            <DialogDescription>{p.monthHint}</DialogDescription>
          </DialogHeader>
          <div className="px-4 pt-2 pb-6 sm:px-8 sm:pb-8">
            <MonthCalendar
              first={first}
              last={last}
              today={today}
              stateOf={stateOf}
              selected={date}
              onSelect={(day) => {
                onDate(day);
                setMonthOpen(false);
              }}
              locale={locale}
              labels={{
                prev: p.prevMonth,
                next: p.nextMonth,
                closed: p.closedDay,
                full: p.full,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  const group = (label: string, GroupIcon: Icon, slots: readonly string[]) => (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        <GroupIcon weight="duotone" aria-hidden className="size-5 text-fern" />
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const isTaken = takenSet.has(slotKey(date!, slot));
          const checked = slot === time;
          return (
            <label
              key={slot}
              className={cn(
                "tnum relative flex h-12 items-center justify-center rounded-2xl border text-[0.95rem] font-semibold transition-colors",
                isTaken &&
                  "cursor-not-allowed border-transparent bg-cream/70 text-ink-soft/40 line-through decoration-1",
                !isTaken &&
                  !checked &&
                  "cursor-pointer border-line bg-white text-ink hover:border-leaf hover:bg-mint/40",
                checked &&
                  "border-leaf bg-leaf text-white shadow-[var(--shadow-soft)]",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf",
              )}
            >
              <input
                type="radio"
                name={`${idPrefix}-time`}
                value={slot}
                checked={checked}
                disabled={isTaken}
                onChange={() => onTime(slot)}
                className="sr-only"
              />
              {formatSlotTime(slot, locale)}
              {isTaken && <span className="sr-only"> ({p.taken})</span>}
            </label>
          );
        })}
      </div>
    </div>
  );

  const timePart = !date ? (
    <p className="text-ink-soft">{p.pickDateFirst}</p>
  ) : openCount(date) === 0 ? (
    <p className="text-ink-soft">{p.noTimes}</p>
  ) : (
    <div className="flex flex-col gap-5">
      <p className="font-medium">{formatDate(date, locale)}</p>
      {group(p.morning, SunIcon, MORNING)}
      {group(p.afternoon, CloudSunIcon, AFTERNOON)}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <Part
        id={`${idPrefix}-day`}
        heading={dayHeading}
        plain={variant === "plain"}
      >
        {dayPart}
      </Part>
      <Part
        id={`${idPrefix}-time`}
        heading={timeHeading}
        plain={variant === "plain"}
        fieldset
      >
        {timePart}
      </Part>
    </div>
  );
}

function Part({
  id,
  heading,
  plain,
  fieldset,
  children,
}: {
  id: string;
  heading: string;
  plain?: boolean;
  fieldset?: boolean;
  children: ReactNode;
}) {
  const className = plain
    ? "min-w-0"
    : "min-w-0 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7";
  const title = (
    <p className={cn("mb-4 font-bold", plain ? "text-base" : "text-lg")}>
      {heading}
    </p>
  );
  return fieldset ? (
    <fieldset className={className}>
      <legend className="sr-only">{heading}</legend>
      <div aria-hidden>{title}</div>
      {children}
    </fieldset>
  ) : (
    <section aria-labelledby={id} className={className}>
      {/* Focusable so a form can move focus here once a service is picked. */}
      <div id={id} tabIndex={-1} className="outline-none">
        {title}
      </div>
      {children}
    </section>
  );
}
