import Link from "next/link";
import { Pager } from "@/components/shared/pager";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { formatMonth } from "@/lib/utils/manila-date";
import { FOLLOW_UPS_PAGE_SIZE } from "../constants";
import { followUpsHref, recordFollowUpsHref } from "../paths";
import type { FollowUpFilters, FollowUpItem } from "../types";
import { EndingChip, TriesSummary } from "./follow-up-bits";

// The Closed tab, inside the toolbar card: history, so a quiet list under
// month headings ("Sorted out in November 2026", newest first). From 1280px a
// table (mother, missed visit, the tries, how it ended); below that stacked
// rows in the same order. A milk footer says which rows are shown and holds
// the pager.
export function ClosedFollowUps({
  t,
  locale,
  items,
  total,
  filters,
}: {
  t: Dictionary;
  locale: Locale;
  items: FollowUpItem[];
  total: number;
  filters: FollowUpFilters;
}) {
  const f = t.followUps;
  if (items.length === 0) {
    const hasFilters = Boolean(filters.q || filters.purok || filters.from || filters.to || filters.tried);
    return <p className="px-6 py-12 text-center text-ink-soft">{hasFilters ? f.empty : f.emptyClosed}</p>;
  }

  const groups = byMonth(items);
  const heading = (month: string) => (month ? format(f.list.sortedIn, { month: formatMonth(month, locale) }) : f.list.sortedEarlier);
  const pages = Math.max(1, Math.ceil(total / FOLLOW_UPS_PAGE_SIZE));
  const first = (filters.page - 1) * FOLLOW_UPS_PAGE_SIZE + 1;

  return (
    <>
      <table className="w-full text-left text-[0.95rem] max-xl:hidden">
        <thead className="bg-milk text-caption text-ink-soft">
          <tr className="border-b border-line">
            <th scope="col" className="py-3 pr-3 pl-6 font-semibold">{f.columns.mother}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{f.columns.missed}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{f.columns.tries}</th>
            <th scope="col" className="py-3 pr-6 pl-3 font-semibold">{f.columns.ending}</th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.month || "earlier"} className="border-b border-line last:border-b-0">
            <tr>
              <th colSpan={4} scope="rowgroup" className="px-6 pt-5 pb-2 text-left text-sm font-bold text-ink">
                {heading(group.month)}
              </th>
            </tr>
            {group.items.map((item) => (
              <tr key={item.appointmentId} className="border-t border-line align-top transition-colors first:border-t-0 hover:bg-milk/70">
                <td className="min-w-[13rem] py-3 pr-3 pl-6">
                  <Mother t={t} item={item} />
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-medium">{item.service}</p>
                  <p className="tnum text-sm text-ink-soft">{formatSlot(item.missedAt, locale, "short")}</p>
                </td>
                <td className="px-3 py-3.5">
                  <TriesSummary t={t} locale={locale} entries={item.entries} />
                </td>
                <td className="py-3.5 pr-6 pl-3">{item.ending && <EndingChip t={t} locale={locale} ending={item.ending} />}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>

      <div className="xl:hidden">
        {groups.map((group) => (
          <section key={group.month || "earlier"} className="border-b border-line last:border-b-0">
            <h3 className="bg-milk px-4 py-2.5 text-sm font-bold text-ink sm:px-6">{heading(group.month)}</h3>
            <ul className="divide-y divide-line">
              {group.items.map((item) => (
                <li key={item.appointmentId} className="flex flex-col gap-3 px-4 py-4 sm:px-6">
                  <Mother t={t} item={item} />
                  <div className="flex flex-col gap-2 pl-[3.25rem]">
                    <p>
                      <span className="font-medium">{item.service}</span>
                      <span className="tnum block text-sm text-ink-soft">{formatSlot(item.missedAt, locale, "short")}</span>
                    </p>
                    <TriesSummary t={t} locale={locale} entries={item.entries} />
                    {item.ending && (
                      <span>
                        <EndingChip t={t} locale={locale} ending={item.ending} />
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line bg-milk px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="tnum text-sm text-ink-soft">{format(f.list.showing, { from: first, to: first + items.length - 1, total })}</p>
        <Pager page={filters.page} pages={pages} hrefFor={(page) => followUpsHref(filters, { page })} labels={{ prev: f.prev, next: f.next, page: f.page }} />
      </div>
    </>
  );
}

/** Groups in list order by the month each was sorted out ("" when that isn't known). */
function byMonth(items: FollowUpItem[]) {
  const groups: { month: string; items: FollowUpItem[] }[] = [];
  for (const item of items) {
    const month = item.ending?.at ? manilaSlot(item.ending.at).date.slice(0, 7) : "";
    const last = groups[groups.length - 1];
    if (last && last.month === month) last.items.push(item);
    else groups.push({ month, items: [item] });
  }
  return groups;
}

function Mother({ t, item }: { t: Dictionary; item: FollowUpItem }) {
  return (
    <span className="flex items-start gap-3">
      <MotherInitials name={item.mother.name} />
      <span className="flex min-w-0 flex-col">
        <Link href={recordFollowUpsHref(item.mother.id)} className="self-start font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
          {item.mother.name}
        </Link>
        <span className="text-sm text-ink-soft">
          <span className="tnum">{item.mother.contactNumber}</span>
          {" · "}
          {item.mother.purok ?? t.followUps.noPurokYet}
        </span>
      </span>
    </span>
  );
}
