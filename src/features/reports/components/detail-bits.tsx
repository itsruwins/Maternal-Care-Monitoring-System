import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRightIcon } from "@/components/icons";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { manilaSlot } from "@/lib/appointments/slots";
import { cn } from "@/lib/utils/cn";
import { formatMonth } from "@/lib/utils/manila-date";
import type { ReportMother } from "../types";

// Pieces shared by the detail tabs, in the Visits list's pattern: one white
// card with a table from 1280px (a milk header row) and line-divided rows
// below, under month headings when the period spans more than one month,
// and a milk footer with the count. On paper, always the table in 10 pt (its
// header repeats on each page).

export const TH = "px-3 py-3 font-semibold whitespace-nowrap first:pl-6 last:pr-6 print:px-1.5 print:py-1 print:first:pl-0 print:last:pr-0";
export const TD = "px-3 py-3.5 first:pl-6 last:pr-6 print:px-1.5 print:py-1.5 print:first:pl-0 print:last:pr-0";
const LINK = "rounded-sm font-semibold text-ink no-underline hover:text-leaf hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid";

type CountKey = "pregnancies" | "visits" | "appointments" | "services" | "sms";
export type DetailGroup<T> = { key: string; label: string | null; rows: T[] };

/** The rows under month headings ("November 2026") when the period spans months; one unnamed group otherwise. */
export function byMonth<T>(rows: T[], at: (row: T) => string, period: { from: string; to: string }, locale: string): DetailGroup<T>[] {
  if (period.from.slice(0, 7) === period.to.slice(0, 7)) return [{ key: "all", label: null, rows }];
  const groups: DetailGroup<T>[] = [];
  for (const row of rows) {
    const month = manilaSlot(at(row)).date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === month) last.rows.push(row);
    else groups.push({ key: month, label: formatMonth(month, locale), rows: [row] });
  }
  return groups;
}

/** The card: the table (wide screens and paper) or the rows, then the count; a note when nothing matches. */
export function DetailFrame<T>({
  t,
  count,
  countKey,
  columns,
  groups,
  row,
  item,
}: {
  t: Dictionary;
  count: number;
  countKey: CountKey;
  /** The table's column heads. */
  columns: string[];
  groups: DetailGroup<T>[];
  /** One table row (a <tr>). */
  row: (value: T) => ReactNode;
  /** One stacked row (an <li>, see DetailRow). */
  item: (value: T) => ReactNode;
}) {
  const d = t.reports.detail;
  if (count === 0) {
    return <p className="rounded-2xl bg-white px-6 py-12 text-center text-ink-soft shadow-[var(--shadow-soft)]">{d.empty}</p>;
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] print:overflow-visible print:rounded-none print:shadow-none">
      <div className="hidden xl:block print:block">
        <table className="w-full text-left text-[0.95rem] print:text-[10pt]">
          <thead className="bg-milk text-caption text-ink-soft print:bg-transparent">
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th key={column} scope="col" className={TH}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.key} className="border-b border-line last:border-b-0">
              {group.label && (
                <tr>
                  <th colSpan={columns.length} scope="rowgroup" className="px-6 pt-5 pb-2 text-left text-sm font-bold text-ink print:px-0 print:pt-3 print:pb-1">
                    {group.label}
                  </th>
                </tr>
              )}
              {group.rows.map(row)}
            </tbody>
          ))}
        </table>
      </div>

      <div className="xl:hidden print:hidden">
        {groups.map((group) => (
          <section key={group.key} className="border-b border-line last:border-b-0">
            {group.label && <h3 className="bg-milk px-4 py-2.5 text-sm font-bold text-ink sm:px-6">{group.label}</h3>}
            <ul className="divide-y divide-line">{group.rows.map(item)}</ul>
          </section>
        ))}
      </div>

      <p className="tnum border-t border-line bg-milk px-4 py-3 text-sm text-ink-soft sm:px-6 print:hidden">
        {count === 1 ? d.count[`${countKey}One`] : format(d.count[countKey], { count })}
      </p>
    </div>
  );
}

/** A table row: a hairline above (none under a month heading), aligned to the top. */
export const ROW = "border-t border-line align-top transition-colors first:border-t-0 hover:bg-milk/70";

/** Her initials, her name (opening her record) and her purok. */
export function MotherCell({ t, mother, href }: { t: Dictionary; mother: ReportMother; href: string }) {
  return (
    <span className="flex min-w-[12rem] items-start gap-3 print:min-w-0">
      <span className="print:hidden">
        <MotherInitials name={mother.name} />
      </span>
      <span className="flex min-w-0 flex-col items-start gap-0.5">
        <Link href={href} className={cn(LINK, "break-words")}>
          {mother.name}
        </Link>
        <span className="text-sm text-ink-soft">{mother.purok ?? t.mothers.noPurokYet}</span>
      </span>
    </span>
  );
}

/** A plain link in a cell (a visit's date opening the visit). */
export function CellLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(LINK, "tnum font-medium whitespace-nowrap")}>
      {children}
    </Link>
  );
}

/**
 * One stacked row (below 1280px): her initials, her name (its link covers the
 * row, one tab stop) with the row's key fact on the right, then her purok and
 * the other lines.
 */
export function DetailRow({
  name,
  href,
  label,
  aside,
  children,
}: {
  name: string;
  href: string;
  /** The link's accessible name, when it opens more than her name says. */
  label?: string;
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="relative flex items-start gap-3 px-4 py-4 transition-colors active:bg-milk sm:px-6">
      <MotherInitials name={name} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-start justify-between gap-3">
          <Link
            href={href}
            aria-label={label}
            className="min-w-0 font-semibold break-words text-ink no-underline after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-leaf focus-visible:after:outline-solid"
          >
            {name}
          </Link>
          <span className="inline-flex shrink-0 items-center gap-1 pt-px text-sm font-semibold text-ink">
            {aside}
            <CaretRightIcon weight="bold" aria-hidden className="size-3.5 text-leaf" />
          </span>
        </span>
        {children}
      </span>
    </li>
  );
}
