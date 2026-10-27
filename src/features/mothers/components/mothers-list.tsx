import { CheckCircleIcon, LocationIcon, PhoneIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatDate } from "@/lib/utils/pregnancy";
import { MOTHERS_PAGE_SIZE } from "../constants";
import type { MotherFilters, MotherListItem } from "../types";
import { PregnancyChip } from "./pregnancy-chip";

// The registry: a table from 768px, stacked cards on phones. Paging keeps the
// current filters.
export function MothersList({
  t,
  locale,
  items,
  total,
  filters,
}: {
  t: Dictionary;
  locale: Locale;
  items: MotherListItem[];
  total: number;
  filters: MotherFilters;
}) {
  const m = t.mothers;
  const pages = Math.max(1, Math.ceil(total / MOTHERS_PAGE_SIZE));
  const hasFilters = Boolean(filters.q || filters.purok || filters.due || filters.status);
  const dueDate = (item: MotherListItem) =>
    item.pregnancy.kind === "active" && item.pregnancy.dueDate ? formatDate(item.pregnancy.dueDate, locale, "short") : "—";
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.purok) params.set("purok", String(filters.purok));
    if (filters.due) params.set("due", filters.due);
    if (filters.status) params.set("status", filters.status);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">
        {hasFilters ? m.empty : m.emptyAll}
      </p>
    );
  }

  const login = (item: MotherListItem) =>
    item.hasLogin ? (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf">
        <CheckCircleIcon weight="fill" aria-hidden className="size-4" />
        {m.hasLogin}
      </span>
    ) : (
      <span className="text-sm text-ink-soft">{m.noLogin}</span>
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">{total === 1 ? m.resultsOne : format(m.results, { count: total })}</p>

      {/* Table (768px and up) */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] md:block">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="border-b border-line text-caption font-semibold text-ink-soft">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">{m.columns.name}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{m.columns.purok}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{m.columns.pregnancy}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{m.columns.due}</th>
              <th scope="col" className="hidden px-5 py-3.5 font-semibold xl:table-cell">{m.columns.login}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <span className="flex flex-col">
                    <span className="font-semibold text-ink">{item.name}</span>
                    <span className="tnum text-sm text-ink-soft">{item.contactNumber}</span>
                    {/* Below 1280px the Login column folds in here. */}
                    <span className="mt-1 xl:hidden">{login(item)}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-ink-soft">{item.purok ?? <span className="italic">{m.noPurokYet}</span>}</td>
                <td className="px-3 py-3"><PregnancyChip t={t} locale={locale} pregnancy={item.pregnancy} /></td>
                <td className="tnum px-3 py-3 whitespace-nowrap text-ink-soft">{dueDate(item)}</td>
                <td className="hidden px-5 py-3 whitespace-nowrap xl:table-cell">{login(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (phones) */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
            <span className="flex flex-col gap-1">
              <span className="font-semibold text-ink">{item.name}</span>
              <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                <span className="tnum inline-flex items-center gap-1.5">
                  <PhoneIcon aria-hidden className="size-4" />
                  {item.contactNumber}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LocationIcon aria-hidden className="size-4" />
                  {item.purok ?? m.noPurokYet}
                </span>
              </span>
            </span>
            <span className="flex flex-col items-start gap-2 border-t border-line pt-3">
              <PregnancyChip t={t} locale={locale} pregnancy={item.pregnancy} />
              {item.pregnancy.kind === "active" && item.pregnancy.dueDate && (
                <span className="tnum text-sm text-ink-soft">
                  {m.columns.due}: {dueDate(item)}
                </span>
              )}
            </span>
            {login(item)}
          </li>
        ))}
      </ul>

      <Pager page={filters.page} pages={pages} hrefFor={pageHref} labels={{ prev: m.prev, next: m.next, page: m.page }} />
    </div>
  );
}
