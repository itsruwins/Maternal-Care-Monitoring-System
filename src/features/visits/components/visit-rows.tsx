import Link from "next/link";
import { CaretRightIcon, DangerIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { addDays } from "@/lib/utils/pregnancy";
import { VISITS_PAGE_SIZE } from "../constants";
import { bpHigh, motherVisitsHref, visitHref, visitsHref } from "../paths";
import type { VisitFilters, VisitRow } from "../types";

// The visits list, inside the toolbar card, under day headings ("Today ·
// Wednesday, November 4", "Yesterday · …", or the date alone). From 1280px a
// table: mother (initials, name, mobile), time, week, blood pressure, weight,
// services, then Open (as the Appointments list; with the sidebar, 1024px is
// too narrow for seven columns in Filipino). Below that line-divided rows,
// each opening the visit. Blood pressure of 140/90 or more
// is rose-deep with a warning mark. A milk footer says which rows are shown
// and holds the pager.
export function VisitRows({
  t,
  locale,
  items,
  total,
  filters,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  items: VisitRow[];
  total: number;
  filters: VisitFilters;
  today: string;
}) {
  const v = t.visits;
  const l = v.list;
  if (items.length === 0) {
    const hasFilters = Boolean(filters.q || filters.from || filters.to);
    return <p className="px-6 py-12 text-center text-ink-soft">{hasFilters ? l.empty : v.recentEmpty}</p>;
  }

  const groups = byDay(items);
  const heading = (date: string, at: string) => {
    const relative = date === today ? l.today : date === addDays(today, -1) ? l.yesterday : null;
    const long = formatSlotDate(at, locale);
    return relative ? `${relative} · ${long}` : long;
  };
  const pages = Math.max(1, Math.ceil(total / VISITS_PAGE_SIZE));
  const first = (filters.page - 1) * VISITS_PAGE_SIZE + 1;

  return (
    <>
      <table className="w-full text-left text-[0.95rem] max-xl:hidden">
        <thead className="bg-milk text-caption text-ink-soft">
          <tr className="border-b border-line">
            <th scope="col" className="py-3 pr-3 pl-6 font-semibold">{l.columns.mother}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.time}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.week}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.bp}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.weight}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.services}</th>
            <th scope="col" className="py-3 pr-4 pl-3">
              <span className="sr-only">{l.open}</span>
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.date} className="border-b border-line last:border-b-0">
            <tr>
              <th colSpan={7} scope="rowgroup" className="px-6 pt-5 pb-2 text-left text-sm font-bold text-ink">
                {heading(group.date, group.items[0].at)}
              </th>
            </tr>
            {group.items.map((visit) => (
              <tr key={visit.id} className="border-t border-line align-top transition-colors first:border-t-0 hover:bg-milk/70">
                <td className="min-w-[13rem] py-3 pr-3 pl-6">
                  <span className="flex items-start gap-3">
                    <MotherInitials name={visit.mother.name} />
                    <span className="flex min-w-0 flex-col">
                      <Link
                        href={motherVisitsHref(visit.mother.id)}
                        className="self-start font-semibold break-words text-ink no-underline hover:text-leaf hover:underline"
                      >
                        {visit.mother.name}
                      </Link>
                      <span className="tnum text-sm text-ink-soft">{visit.mother.contactNumber}</span>
                    </span>
                  </span>
                </td>
                <td className="tnum px-3 py-4 font-semibold whitespace-nowrap text-ink">{formatSlotClock(visit.at, locale)}</td>
                <td className="px-3 py-4 whitespace-nowrap">{format(v.weekShort, { weeks: visit.weeks })}</td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <Bp t={t} visit={visit} />
                </td>
                <td className="tnum px-3 py-4 whitespace-nowrap">{`${visit.weightKg} kg`}</td>
                <td className="max-w-56 px-3 py-4">
                  <Services t={t} services={visit.services} />
                </td>
                <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                  <Button asChild variant="soft" size="sm">
                    <Link href={visitHref(visit.id)} aria-label={format(l.openLabel, { name: visit.mother.name })} className="no-underline">
                      {l.open}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>

      {/* Rows (below 1280px): the name opens the visit and covers the row (one tab stop). */}
      <div className="xl:hidden">
        {groups.map((group) => (
          <section key={group.date} className="border-b border-line last:border-b-0">
            <h3 className="bg-milk px-4 py-2.5 text-sm font-bold text-ink sm:px-6">{heading(group.date, group.items[0].at)}</h3>
            <ul className="divide-y divide-line">
              {group.items.map((visit) => (
                <li key={visit.id} className="relative flex items-start gap-3 px-4 py-4 transition-colors active:bg-milk sm:px-6">
                  <MotherInitials name={visit.mother.name} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-start justify-between gap-3">
                      <Link
                        href={visitHref(visit.id)}
                        aria-label={format(l.openLabel, { name: visit.mother.name })}
                        className="min-w-0 font-semibold break-words text-ink no-underline after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-leaf focus-visible:after:outline-solid"
                      >
                        {visit.mother.name}
                      </Link>
                      <span className="tnum inline-flex shrink-0 items-center gap-1 pt-px text-sm font-semibold text-ink">
                        {formatSlotClock(visit.at, locale)}
                        <CaretRightIcon weight="bold" aria-hidden className="size-3.5 text-leaf" />
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
                      <span className="font-semibold whitespace-nowrap text-ink">{format(v.weekShort, { weeks: visit.weeks })}</span>
                      <span>
                        {l.columns.bp} <Bp t={t} visit={visit} />
                      </span>
                      <span className="tnum">{`${visit.weightKg} kg`}</span>
                    </span>
                    <span className="text-sm">
                      <Services t={t} services={visit.services} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line bg-milk px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="tnum text-sm text-ink-soft">{format(l.showing, { from: first, to: first + items.length - 1, total })}</p>
        <Pager page={filters.page} pages={pages} hrefFor={(page) => visitsHref(filters, { page })} labels={{ prev: l.prev, next: l.next, page: l.page }} />
      </div>
    </>
  );
}

function byDay(items: VisitRow[]) {
  const groups: { date: string; items: VisitRow[] }[] = [];
  for (const item of items) {
    const date = manilaSlot(item.at).date;
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.items.push(item);
    else groups.push({ date, items: [item] });
  }
  return groups;
}

/** "110/70"; 140/90 or more turns rose-deep with a warning mark (and says so to screen readers). */
function Bp({ t, visit }: { t: Dictionary; visit: VisitRow }) {
  const high = bpHigh(visit.bpSystolic, visit.bpDiastolic);
  const value = `${visit.bpSystolic}/${visit.bpDiastolic}`;
  if (!high) return <span className="tnum text-ink">{value}</span>;
  return (
    <span className="tnum inline-flex items-center gap-1 font-bold text-rose-deep">
      <DangerIcon weight="fill" aria-hidden className="size-4 shrink-0" />
      {value}
      <span className="sr-only">{` (${t.visits.list.bpHigh})`}</span>
    </span>
  );
}

/** The first service given, then "+2" for the rest; "No services" when none. */
function Services({ t, services }: { t: Dictionary; services: string[] }) {
  const v = t.visits;
  if (services.length === 0) return <span className="text-ink-soft">{v.noServices}</span>;
  const rest = services.length - 1;
  return (
    <span className="break-words text-ink-soft" title={services.join(", ")}>
      <span className="text-ink">{services[0]}</span>
      {rest > 0 && (
        <>
          {/* A no-break space keeps the count with the name's last word. */}
          {"\u00a0"}
          <span aria-hidden className="tnum rounded-full bg-cream px-1.5 py-0.5 text-caption font-semibold whitespace-nowrap text-ink-soft">
            {format(v.list.servicesMore, { count: rest })}
          </span>
          <span className="sr-only">{`${format(v.list.servicesMoreLabel, { count: rest })}: ${services.slice(1).join(", ")}`}</span>
        </>
      )}
    </span>
  );
}
