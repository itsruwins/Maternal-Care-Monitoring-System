import { CaretRightIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatShortDay, formatWeekday } from "../format";
import { REPORTS_PATH } from "../paths";
import type { VisitDay } from "../types";
import { DashCard } from "./dash-card";

// Chart green stays inside charts (DESIGN.md).
const GREEN = "#16805F";
/** Room for the columns under their value labels (the plot is 144px tall). */
const BAR_AREA = 116;
/** A Monday label this close to the end would run into "Today". */
const TODAY_ROOM = 3;

// Completed visits per clinic day over the last 30 days, one series in chart
// green (the Reports chart's rules, by day): each count above its column, an
// empty day as a short line on the baseline, Mondays and today labelled
// below. The columns rise once when the page opens (not with reduced motion).
// Hovering shows the day; "Show as table" lists every day.
export function VisitsByDayChart({ t, locale, days, today }: { t: Dictionary; locale: Locale; days: VisitDay[]; today: string }) {
  const c = t.dashboard.chart;
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const max = Math.max(1, ...days.map((day) => day.count));
  const visits = (count: number) => (count === 1 ? c.totalOne : format(c.total, { count }));
  const dayName = (date: string) => `${formatWeekday(date, locale)}, ${formatShortDay(date, locale)}`;
  const label = (date: string, index: number) => {
    if (date === today) return c.today;
    const monday = new Date(`${date}T00:00:00Z`).getUTCDay() === 1;
    return monday && days.length - 1 - index >= TODAY_ROOM ? formatShortDay(date, locale) : null;
  };

  return (
    <DashCard id="dash-chart" title={c.title} link={{ href: REPORTS_PATH, label: c.reports }}>
      <figure className="px-5 pt-1 pb-5 sm:px-6 sm:pb-6">
        <figcaption>
          <span className="tnum block text-2xl leading-8 font-extrabold tracking-[-0.02em] text-ink">{visits(total)}</span>
          <span className="block text-sm text-ink-soft">{c.note}</span>
        </figcaption>

        <ul className="mt-4 flex h-36 items-end gap-[3px] border-b border-ink-soft/40 sm:gap-1">
          {days.map((day, index) => (
            <li key={day.date} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
              {day.count > 0 && (
                <span aria-hidden className="tnum mb-1 text-xs font-semibold text-ink-soft">
                  {day.count}
                </span>
              )}
              <span
                aria-hidden
                className="block w-full max-w-6 origin-bottom rounded-t-[4px] transition-opacity group-hover:opacity-80 motion-safe:animate-rise"
                style={{
                  height: day.count > 0 ? `${(day.count / max) * BAR_AREA}px` : "2px",
                  background: day.count > 0 ? GREEN : "var(--color-line)",
                  animationDelay: `${index * 18}ms`,
                }}
              />
              <span className="sr-only">
                {dayName(day.date)}: {visits(day.count)}
              </span>
              {/* Hover readout, above the column (kept inside the card at the ends). */}
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-xl bg-ink px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-[var(--shadow-soft)] group-hover:block ${
                  index < 3 ? "left-0" : index > days.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                {dayName(day.date)}
                <span className="tnum block font-bold">{visits(day.count)}</span>
              </span>
            </li>
          ))}
        </ul>
        <ul aria-hidden className="mt-1.5 flex gap-[3px] sm:gap-1">
          {days.map((day, index) => {
            const text = label(day.date, index);
            return (
              <li key={day.date} className="relative h-4 min-w-0 flex-1">
                {text && (
                  <span
                    className={`absolute top-0 text-xs leading-4 whitespace-nowrap ${
                      day.date === today ? "right-0 font-semibold text-ink" : "left-1/2 -translate-x-1/2 text-ink-soft"
                    }`}
                  >
                    {text}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <details className="group mt-3 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid [&::-webkit-details-marker]:hidden">
            <CaretRightIcon weight="bold" aria-hidden className="size-3.5 transition-transform group-open:rotate-90" />
            {c.showTable}
          </summary>
          <table className="mt-2 w-full text-left">
            <thead className="text-caption text-ink-soft">
              <tr>
                <th scope="col" className="py-1.5 font-semibold">
                  {c.colDay}
                </th>
                <th scope="col" className="py-1.5 text-right font-semibold">
                  {c.colVisits}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {days.map((day) => (
                <tr key={day.date}>
                  <td className="tnum py-1.5">{dayName(day.date)}</td>
                  <td className="tnum py-1.5 text-right font-semibold">{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>
    </DashCard>
  );
}
