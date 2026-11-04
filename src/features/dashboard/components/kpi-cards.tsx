import Link from "next/link";
import {
  AppointmentIcon,
  CalendarIcon,
  CallIcon,
  CaretRightIcon,
  CheckupIcon,
  PregnancyIcon,
  type Icon,
} from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatMonthDay } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_LINKS } from "../paths";
import type { DashboardContext, DashboardCounts } from "../types";

type Key = keyof DashboardCounts;

const CARDS: { key: Key; icon: Icon }[] = [
  { key: "today", icon: CheckupIcon },
  { key: "requests", icon: AppointmentIcon },
  { key: "followUps", icon: CallIcon },
  { key: "pregnant", icon: PregnancyIcon },
  { key: "dueSoon", icon: CalendarIcon },
];
// Counts that need someone: rose-deep above zero (The Rose Is an Accent Rule).
const ALERTS: ReadonlySet<Key> = new Set(["requests", "followUps"]);

/** "Today's appointments" → "Today's " and "appointments". */
const leadingWords = (label: string) => label.slice(0, label.lastIndexOf(" ") + 1);
const lastWord = (label: string) => label.slice(label.lastIndexOf(" ") + 1);

// Five count cards, each opening the list behind it: the count beside a small
// icon circle, the label (with a caret glued to its last word), then one line
// on what it is made of, kept to the bottom so the lines share a row. Two per row on phones (the fifth spans the
// row), three over two from 768px, five across from 1280px.
export function KpiCards({
  t,
  locale,
  counts,
  context,
}: {
  t: Dictionary;
  locale: Locale;
  counts: DashboardCounts;
  context: DashboardContext;
}) {
  const c = t.dashboard.counts;
  return (
    <nav aria-label={t.dashboard.countsLabel}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-6 xl:grid-cols-5">
        {CARDS.map(({ key, icon }, index) => {
          const alert = ALERTS.has(key) && counts[key] > 0;
          const line = contextLine(t, locale, key, counts, context);
          return (
            <li
              key={key}
              className={cn(
                "min-w-0 max-md:last:col-span-2 xl:col-span-1",
                index < 3 ? "md:col-span-2" : "md:col-span-3",
              )}
            >
              <Link
                href={DASHBOARD_LINKS[key]}
                className="group flex h-full flex-col rounded-2xl border-2 border-transparent bg-white p-4 no-underline shadow-[var(--shadow-soft)] transition-[border-color,transform] duration-200 ease-[var(--ease-out-expo)] hover:border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid active:scale-[0.98] sm:p-5"
              >
                <span className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "tnum pt-0.5 text-[2rem] leading-none font-extrabold tracking-[-0.02em]",
                      alert ? "text-rose-deep" : "text-ink",
                    )}
                  >
                    {counts[key]}
                  </span>
                  <IconCircle icon={icon} tone={alert ? "blush" : "mint"} size="sm" />
                </span>
                {/* The caret stays glued to the last word, even when the label wraps. */}
                <span className="mt-2 text-sm leading-5 font-semibold text-ink">
                  {leadingWords(c[key])}
                  <span className="whitespace-nowrap">
                    {lastWord(c[key])}
                    <CaretRightIcon
                      weight="bold"
                      aria-hidden
                      className="ml-1 inline size-3.5 align-[-0.125em] text-leaf transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
                <span
                  className={cn(
                    "tnum mt-auto pt-1.5 text-sm leading-5",
                    line.alert ? "font-semibold text-rose-deep" : "text-ink-soft",
                  )}
                >
                  {line.text}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The line under a count. Dates keep their month and day together. */
function contextLine(
  t: Dictionary,
  locale: Locale,
  key: Key,
  counts: DashboardCounts,
  context: DashboardContext,
): { text: string; alert?: boolean } {
  const x = t.dashboard.context;
  const day = (iso: string) => formatMonthDay(iso, locale).replace(/ /g, " ");
  switch (key) {
    case "today": {
      if (counts.today === 0) return { text: x.todayNone };
      const left = Math.max(counts.today - context.todayDone - context.todayMissed, 0);
      return context.todayMissed > 0
        ? { text: format(x.todayMissed, { done: context.todayDone, left, missed: context.todayMissed }) }
        : { text: format(x.today, { done: context.todayDone, left }) };
    }
    case "requests":
      return context.oldestRequestAt ? { text: format(x.requests, { date: day(context.oldestRequestAt) }) } : { text: x.requestsNone };
    case "followUps":
      return context.oldestMissedAt ? { text: format(x.followUps, { date: day(context.oldestMissedAt) }) } : { text: x.followUpsNone };
    case "pregnant":
      return context.thirdTrimester > 0 ? { text: format(x.pregnant, { count: context.thirdTrimester }) } : { text: x.pregnantNone };
    case "dueSoon":
      return context.pastDue > 0 ? { text: format(x.pastDue, { count: context.pastDue }), alert: true } : { text: x.pastDueNone };
  }
}
