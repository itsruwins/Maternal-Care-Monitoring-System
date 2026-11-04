import { ArrowDownIcon, ArrowUpIcon, EqualsIcon, type Icon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { MyVisitRow } from "../types";

// Chart green (DESIGN.md), the same as the reports' bars.
const GREEN = "#16805F";

// How many recent readings each card lists (all visits stay in "Your visits").
const RECENT = 5;

/** "Nov 4" in Manila time. */
function monthDay(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric" }).format(new Date(iso));
}

// Her weight and blood pressure as plain numbers: the latest reading big, what
// changed since the visit before in words, and her recent readings listed by
// date. Neutral on purpose: no "good" or "high" colours, her midwife explains.
// visits: this pregnancy, newest first.
export function NumbersSummary({ t, locale, visits }: { t: Dictionary; locale: Locale; visits: MyVisitRow[] }) {
  const m = t.myVisits;
  const [latest, before] = visits;
  const recent = visits.slice(0, RECENT);
  const date = before ? monthDay(before.at, locale) : "";

  // Weight change, rounded to 0.1 kg so 60.1 − 59.6 reads 0.5.
  const diff = before ? Math.round((latest.weightKg - before.weightKg) * 10) / 10 : 0;
  const weightChange: [Icon, string] | null = !before
    ? null
    : diff > 0
      ? [ArrowUpIcon, format(m.weightUp, { kg: diff, date })]
      : diff < 0
        ? [ArrowDownIcon, format(m.weightDown, { kg: -diff, date })]
        : [EqualsIcon, format(m.weightSame, { date })];

  // Bars start 5 kg under her lowest weight: steady weeks look steady, and
  // weight gained over the pregnancy still shows.
  const weights = recent.map((v) => v.weightKg);
  const low = Math.max(0, Math.floor(Math.min(...weights)) - 5);
  const high = Math.max(...weights);
  const share = (kg: number) => Math.max(8, ((kg - low) / Math.max(high - low, 1)) * 100);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <NumberCard
        title={m.weight}
        value={String(latest.weightKg)}
        unit="kg"
        change={weightChange}
        first={!before ? m.firstReading : null}
        recentLabel={m.recent}
        rows={recent.map((v) => ({
          id: v.id,
          date: monthDay(v.at, locale),
          value: `${v.weightKg} kg`,
          bar: share(v.weightKg),
        }))}
      />
      <NumberCard
        title={m.bp}
        value={`${latest.bpSystolic}/${latest.bpDiastolic}`}
        unit="mmHg"
        change={before ? [null, format(m.bpBefore, { date, bp: `${before.bpSystolic}/${before.bpDiastolic}` })] : null}
        first={!before ? m.firstReading : null}
        recentLabel={m.recent}
        rows={recent.map((v) => ({ id: v.id, date: monthDay(v.at, locale), value: `${v.bpSystolic}/${v.bpDiastolic}` }))}
      />
    </div>
  );
}

function NumberCard({
  title,
  value,
  unit,
  change,
  first,
  recentLabel,
  rows,
}: {
  title: string;
  value: string;
  unit: string;
  change: [Icon | null, string] | null;
  first: string | null;
  recentLabel: string;
  rows: { id: number; date: string; value: string; bar?: number }[];
}) {
  const ChangeIcon = change?.[0];
  return (
    <section className="flex flex-col rounded-2xl bg-milk p-5">
      <h3 className="font-bold">{title}</h3>
      <p className="tnum mt-1 text-[2.5rem] leading-tight font-extrabold text-ink">
        {value}
        <span className="ml-1.5 text-base font-medium text-ink-soft">{unit}</span>
      </p>
      {change && (
        <p className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink">
          {ChangeIcon && <ChangeIcon weight="bold" aria-hidden className="size-4 shrink-0 text-leaf" />}
          {change[1]}
        </p>
      )}
      {first && <p className="mt-2 text-sm text-ink-soft">{first}</p>}

      {rows.length > 1 && (
        <>
          <h4 className="mt-5 text-sm font-semibold text-ink-soft">{recentLabel}</h4>
          <ul className="mt-1 divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-3 py-2">
                <span className="tnum w-16 shrink-0 text-sm text-ink-soft">{row.date}</span>
                {row.bar !== undefined && (
                  <span aria-hidden className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-cream">
                    <span className="block h-full rounded-full" style={{ width: `${row.bar}%`, backgroundColor: GREEN }} />
                  </span>
                )}
                <span className={row.bar === undefined ? "tnum font-semibold" : "tnum w-16 shrink-0 text-right font-semibold"}>{row.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
