import Link from "next/link";
import type { ReactNode } from "react";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import type { ReportMother } from "../types";

// Small pieces shared by the detail tabs: a table from 1280px, cards below
// (two columns from 768px), like the SMS log.

export const TH = "px-3 py-3.5 font-semibold whitespace-nowrap first:pl-5 last:pr-5";
export const TD = "px-3 py-4 first:pl-5 last:pr-5";
const LINK = "rounded-sm font-semibold text-ink no-underline hover:text-leaf hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid";

type CountKey = "pregnancies" | "visits" | "appointments" | "services" | "sms";

/** The count line, then the table (wide screens) or the cards; a note when nothing matches. */
export function DetailFrame({
  t,
  count,
  countKey,
  table,
  cards,
}: {
  t: Dictionary;
  count: number;
  countKey: CountKey;
  table: ReactNode;
  cards: ReactNode;
}) {
  const d = t.reports.detail;
  if (count === 0) {
    return <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{d.empty}</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="tnum text-sm text-ink-soft">{count === 1 ? d.count[`${countKey}One`] : format(d.count[countKey], { count })}</p>
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] xl:block">
        <table className="w-full text-left text-[0.95rem]">{table}</table>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">{cards}</ul>
    </div>
  );
}

/** Her name (opening her record) and her purok. */
export function MotherCell({ t, mother, href }: { t: Dictionary; mother: ReportMother; href: string }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5">
      <Link href={href} className={cn(LINK, "break-words")}>
        {mother.name}
      </Link>
      <span className="text-sm text-ink-soft">{mother.purok ?? t.mothers.noPurokYet}</span>
    </div>
  );
}

/** A plain link in a cell (a visit's date opening the visit). */
export function CellLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(LINK, "font-medium")}>
      {children}
    </Link>
  );
}

/** One row as a card: who it's about, an optional chip line, then label and value pairs. */
export function DetailCard({
  mother,
  top,
  fields,
}: {
  mother: ReactNode;
  top?: ReactNode;
  fields: { label: string; value: ReactNode }[];
}) {
  return (
    <li>
      <article className="flex h-full flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
        {top && <div className="flex flex-col items-start gap-1">{top}</div>}
        <div className={cn(top && "border-t border-line pt-3")}>{mother}</div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[0.95rem]">
          {fields.map((field) => (
            <div key={field.label} className="contents">
              <dt className="text-ink-soft">{field.label}</dt>
              <dd className="tnum min-w-0 break-words text-ink">{field.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </li>
  );
}
