import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, CaretUpDownIcon, CheckCircleIcon, ClockIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { daysBetween, formatDate } from "@/lib/utils/pregnancy";
import { MOTHERS_PAGE_SIZE } from "../constants";
import { motherRecordHref, mothersHref } from "../paths";
import type { MotherFilters, MotherListItem, MotherSort } from "../types";
import { MotherInitials } from "./mother-initials";
import { MotherRowActions } from "./mother-row-actions";
import { PregnancyChip } from "./pregnancy-chip";

const CHIP = "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap";

// The registry's list, inside the toolbar card: a table from 768px (sortable
// Mother and Due date headers, Login folding under the name below 1280px,
// the ⋯ menu last), line-divided rows on phones (the whole row opens her
// record). Each mother: initials, name and mobile; pregnancy week with a
// thin bar of the 40 weeks (a filled rose "Past due" once the due date has
// passed); due date with how long is left. A milk footer says which rows are
// shown and holds the pager.
export function MothersList({
  t,
  locale,
  items,
  total,
  filters,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  items: MotherListItem[];
  total: number;
  filters: MotherFilters;
  today: string;
}) {
  const m = t.mothers;
  const pages = Math.max(1, Math.ceil(total / MOTHERS_PAGE_SIZE));
  const actions = (name: string) => ({ ...m.rowActions, menu: format(m.rowActions.menu, { name }) });

  if (items.length === 0) {
    const hasFilters = Boolean(filters.q || filters.purok || filters.due || filters.status);
    return <p className="px-6 py-12 text-center text-ink-soft">{hasFilters ? m.empty : m.emptyAll}</p>;
  }

  const first = (filters.page - 1) * MOTHERS_PAGE_SIZE + 1;
  const last = first + items.length - 1;

  return (
    <>
      {/* Table (768px and up) */}
      <table className="w-full text-left text-[0.95rem] max-md:hidden">
        <thead className="bg-milk text-caption text-ink-soft">
          <tr className="border-b border-line">
            <SortHeader t={t} filters={filters} column="name" label={m.columns.name} className="pr-3 pl-5 sm:pl-6" />
            <th scope="col" className="px-3 py-3 font-semibold whitespace-nowrap max-xl:hidden">
              {m.columns.purok}
            </th>
            <th scope="col" className="px-3 py-3 font-semibold whitespace-nowrap">
              {m.columns.pregnancy}
            </th>
            <SortHeader t={t} filters={filters} column="due" label={m.columns.due} className="px-3" />
            <th scope="col" className="px-3 py-3 font-semibold whitespace-nowrap max-xl:hidden">
              {m.columns.login}
            </th>
            <th scope="col" className="w-14 py-3 pr-3 sm:pr-4">
              <span className="sr-only">{m.rowActions.open}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-milk/70">
              <td className="min-w-[13rem] py-3 pr-3 pl-5 sm:pl-6">
                <span className="flex items-center gap-3">
                  <MotherInitials name={item.name} />
                  <span className="flex min-w-0 flex-col">
                    <Link href={motherRecordHref(item.id)} className="self-start font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
                      {item.name}
                    </Link>
                    <span className="text-sm text-ink-soft">
                      <span className="tnum">{item.contactNumber}</span>
                      {/* Below 1280px the Purok and Login columns fold in here. */}
                      <span className="xl:hidden">
                        {" · "}
                        {item.purok ?? m.noPurokYet}
                      </span>
                    </span>
                    <span className="mt-1 xl:hidden">
                      <Login t={t} hasLogin={item.hasLogin} />
                    </span>
                  </span>
                </span>
              </td>
              <td className="min-w-24 px-3 py-3 text-ink-soft max-xl:hidden">{item.purok ?? <span className="italic">{m.noPurokYet}</span>}</td>
              <td className="px-3 py-3">
                <PregnancyCell t={t} locale={locale} item={item} today={today} />
              </td>
              <td className="min-w-36 px-3 py-3">
                <DueCell t={t} locale={locale} item={item} today={today} />
              </td>
              <td className="px-3 py-3 whitespace-nowrap max-xl:hidden">
                <Login t={t} hasLogin={item.hasLogin} />
              </td>
              <td className="py-3 pr-3 text-right sm:pr-4">
                <MotherRowActions motherId={item.id} pregnant={item.pregnancy.kind === "active"} labels={actions(item.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rows (phones): the name link covers the row (one tab stop), the ⋯ menu sits above it. */}
      <ul className="divide-y divide-line md:hidden">
        {items.map((item) => (
          <li key={item.id} className="relative flex flex-col gap-3 px-4 py-4 transition-colors active:bg-milk">
            <span className="flex items-start gap-3 pr-10">
              <MotherInitials name={item.name} />
              <span className="flex min-w-0 flex-col">
                <Link href={motherRecordHref(item.id)} className="font-semibold break-words text-ink no-underline after:absolute after:inset-0">
                  {item.name}
                </Link>
                <span className="text-sm text-ink-soft">
                  <span className="tnum">{item.contactNumber}</span>
                  {" · "}
                  {item.purok ?? m.noPurokYet}
                </span>
              </span>
            </span>
            <MotherRowActions
              motherId={item.id}
              pregnant={item.pregnancy.kind === "active"}
              labels={actions(item.name)}
              className="absolute top-2.5 right-2 z-10"
            />
            <span className="flex flex-col gap-2.5 pl-[3.25rem]">
              <PregnancyCell t={t} locale={locale} item={item} today={today} />
              <DueCell t={t} locale={locale} item={item} today={today} />
            </span>
            <span className="pl-[3.25rem]">
              <Login t={t} hasLogin={item.hasLogin} />
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-line bg-milk px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="tnum text-sm text-ink-soft">{format(m.showing, { from: first, to: last, total })}</p>
        <Pager
          page={filters.page}
          pages={pages}
          hrefFor={(page) => mothersHref(filters, { page })}
          labels={{ prev: m.prev, next: m.next, page: m.page }}
        />
      </div>
    </>
  );
}

/** A sortable column head: A to Z (or soonest first), then the reverse. */
function SortHeader({
  t,
  filters,
  column,
  label,
  className,
}: {
  t: Dictionary;
  filters: MotherFilters;
  column: "name" | "due";
  label: string;
  className?: string;
}) {
  const active = filters.sort === column || filters.sort === `-${column}`;
  const descending = filters.sort === `-${column}`;
  const next: MotherSort = active && !descending ? (`-${column}` as MotherSort) : column;
  const Icon = !active ? CaretUpDownIcon : descending ? ArrowDownIcon : ArrowUpIcon;
  return (
    <th scope="col" aria-sort={active ? (descending ? "descending" : "ascending") : "none"} className={cn("py-1.5 font-semibold", className)}>
      <Link
        href={mothersHref(filters, { sort: next })}
        scroll={false}
        aria-label={format(t.mothers.sortBy, { column: label })}
        className={cn(
          "-mx-1.5 inline-flex min-h-9 items-center gap-1 rounded-lg px-1.5 whitespace-nowrap no-underline transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-leaf focus-visible:outline-solid",
          active ? "text-ink" : "text-ink-soft",
        )}
      >
        {label}
        <Icon weight="bold" aria-hidden className={cn("size-3.5", active ? "text-leaf" : "text-ink-soft/70")} />
      </Link>
    </th>
  );
}

/** Week chip and trimester over a bar of the 40 weeks; past due turns it rose. Otherwise her last outcome. */
function PregnancyCell({ t, locale, item, today }: { t: Dictionary; locale: Locale; item: MotherListItem; today: string }) {
  const m = t.mothers;
  const pregnancy = item.pregnancy;
  if (pregnancy.kind !== "active") return <PregnancyChip t={t} locale={locale} pregnancy={pregnancy} />;
  const pastDue = pregnancy.dueDate !== null && pregnancy.dueDate < today;
  const share = pregnancy.weeks !== null ? Math.min(pregnancy.weeks / 40, 1) : null;
  return (
    <span className="flex flex-col gap-2">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {pastDue ? (
          <span className={cn(CHIP, "bg-rose-deep text-white")}>
            <ClockIcon weight="bold" aria-hidden className="size-3.5" />
            {m.pastDue}
          </span>
        ) : (
          <span className={cn(CHIP, "bg-blush text-rose-deep")}>
            {pregnancy.weeks !== null ? format(m.week, { weeks: pregnancy.weeks }) : m.search.pregnant}
          </span>
        )}
        <span className="text-sm whitespace-nowrap text-ink-soft">
          {pastDue && pregnancy.weeks !== null
            ? format(m.week, { weeks: pregnancy.weeks })
            : pregnancy.trimester
              ? m.trimesters[pregnancy.trimester - 1]
              : null}
        </span>
      </span>
      {share !== null && (
        <span
          role="img"
          aria-label={format(m.progress, { weeks: pregnancy.weeks! })}
          className="block h-1.5 w-32 overflow-hidden rounded-full bg-mint"
        >
          <span
            className={cn("block h-full origin-left rounded-full motion-safe:animate-grow-x", pastDue ? "bg-rose-deep" : "bg-leaf")}
            style={{ width: `${share * 100}%` }}
          />
        </span>
      )}
    </span>
  );
}

/** The due date over how long is left (the dashboard's words); rose-deep once past. */
function DueCell({ t, locale, item, today }: { t: Dictionary; locale: Locale; item: MotherListItem; today: string }) {
  const d = t.dashboard.due;
  const pregnancy = item.pregnancy;
  if (pregnancy.kind !== "active" || !pregnancy.dueDate) return <span className="text-ink-soft">—</span>;
  const days = daysBetween(today, pregnancy.dueDate) ?? 0;
  const line =
    days < 0 ? (days === -1 ? d.pastDueOne : format(d.pastDue, { days: -days })) : days === 0 ? d.dueToday : days === 1 ? d.tomorrow : format(d.inDays, { days });
  return (
    <span className="flex flex-col">
      <span className="tnum font-medium whitespace-nowrap text-ink">{formatDate(pregnancy.dueDate, locale, "short")}</span>
      <span className={cn("tnum text-sm", days < 0 ? "font-semibold text-rose-deep" : "text-ink-soft")}>{line}</span>
    </span>
  );
}

function Login({ t, hasLogin }: { t: Dictionary; hasLogin: boolean }) {
  return hasLogin ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf">
      <CheckCircleIcon weight="fill" aria-hidden className="size-4" />
      {t.mothers.hasLogin}
    </span>
  ) : (
    <span className="text-sm text-ink-soft">{t.mothers.noLogin}</span>
  );
}

