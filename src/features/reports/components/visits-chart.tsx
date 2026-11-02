import { CaretRightIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { bucketLabel, bucketName } from "../format";
import type { VisitBucket } from "../types";

// Chart green stays inside charts (DESIGN.md).
const GREEN = "#16805F";
/** Room for the bars under their value labels (the plot is 160px tall). */
const BAR_AREA = 132;
/** Most date labels under the chart; the rest are thinned out. */
const MAX_LABELS = 7;

// Completed visits per week (or month), one series: plain columns in chart
// green, at most 24px wide, rounded 4px at the top and square on the
// baseline. Each count is written above its column, hovering a column shows
// its dates, and "Show as table" lists every column. On paper, only the table.
export function VisitsChart({
  t,
  locale,
  grouping,
  buckets,
}: {
  t: Dictionary;
  locale: Locale;
  grouping: "week" | "month";
  buckets: VisitBucket[];
}) {
  const v = t.reports.summary.visits;
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const every = Math.ceil(buckets.length / MAX_LABELS);
  const visits = (count: number) => (count === 1 ? v.visitsOne : format(v.visitsCount, { count }));

  const table = (
    <table className="mt-2 w-full text-left">
      <thead className="text-caption text-ink-soft">
        <tr>
          <th scope="col" className="py-1.5 font-semibold">
            {grouping === "week" ? v.colWeek : v.colMonth}
          </th>
          <th scope="col" className="py-1.5 text-right font-semibold">
            {v.colVisits}
          </th>
        </tr>
      </thead>
      <tbody className="tnum divide-y divide-line">
        {buckets.map((bucket) => (
          <tr key={bucket.start}>
            <td className="py-1.5">{bucketName(bucket.start, bucket.end, grouping, locale)}</td>
            <td className="py-1.5 text-right font-semibold">{bucket.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <figure className="mt-4 border-t border-line pt-4">
      <figcaption>
        <span className="block font-semibold text-ink">{grouping === "week" ? v.chartWeek : v.chartMonth}</span>
        {grouping === "week" && <span className="block text-sm text-ink-soft">{v.chartNote}</span>}
      </figcaption>

      <ul className="mt-3 flex h-40 items-end gap-1 border-b border-ink-soft/40 print:hidden">
        {buckets.map((bucket) => (
          <li key={bucket.start} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            <span aria-hidden className="tnum mb-1 text-xs font-semibold text-ink-soft">
              {bucket.count}
            </span>
            <span
              aria-hidden
              className="block w-full max-w-6 rounded-t-[4px] transition-opacity group-hover:opacity-80"
              style={{ height: `${(bucket.count / max) * BAR_AREA}px`, background: GREEN }}
            />
            <span className="sr-only">
              {bucketName(bucket.start, bucket.end, grouping, locale)}: {visits(bucket.count)}
            </span>
            {/* Hover readout, above the column. */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-xl bg-ink px-3 py-1.5 text-sm whitespace-nowrap text-white shadow-[var(--shadow-soft)] group-hover:block"
            >
              {bucketName(bucket.start, bucket.end, grouping, locale)}
              <span className="tnum block font-bold">{visits(bucket.count)}</span>
            </span>
          </li>
        ))}
      </ul>
      <ul aria-hidden className="mt-1.5 flex gap-1 print:hidden">
        {buckets.map((bucket, index) => (
          <li key={bucket.start} className="min-w-0 flex-1 overflow-visible text-center text-xs whitespace-nowrap text-ink-soft">
            {index % every === 0 ? bucketLabel(bucket.start, grouping, locale) : ""}
          </li>
        ))}
      </ul>

      <details className="group mt-4 text-sm print:hidden">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid [&::-webkit-details-marker]:hidden">
          <CaretRightIcon weight="bold" aria-hidden className="size-3.5 transition-transform group-open:rotate-90" />
          {v.showTable}
        </summary>
        {table}
      </details>
      {/* A closed <details> doesn't print, so paper gets its own copy. */}
      <div aria-hidden className="hidden print:block">{table}</div>
    </figure>
  );
}
