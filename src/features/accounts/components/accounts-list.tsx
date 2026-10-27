import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatDateTime } from "@/lib/utils/date-time";
import { ACCOUNTS_PAGE_SIZE, positionKeyOf } from "../constants";
import type { AccountFilters, AccountListItem } from "../types";
import { RoleBadge, StatusBadge } from "./badges";

// The accounts list: a table from 768px, stacked cards on phones. Each row
// opens the account. Paging keeps the current filters.
export function AccountsList({
  t,
  locale,
  items,
  total,
  filters,
}: {
  t: Dictionary;
  locale: Locale;
  items: AccountListItem[];
  total: number;
  filters: AccountFilters;
}) {
  const a = t.accounts;
  const pages = Math.max(1, Math.ceil(total / ACCOUNTS_PAGE_SIZE));
  const lastLogin = (iso: string | null) => (iso ? formatDateTime(iso, locale) : a.never);
  const position = (value: string | null) => {
    if (!value) return "—";
    const key = positionKeyOf(value);
    return key === "other" ? value : a.positions[key];
  };
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{a.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">{format(a.results, { count: total })}</p>

      {/* Table (768px and up) */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] md:block">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="border-b border-line text-caption font-semibold text-ink-soft">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">{a.columns.name}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{a.columns.role}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{a.columns.position}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{a.columns.status}</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">{a.columns.lastLogin}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.userId} className="transition-colors hover:bg-milk">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/accounts/${item.userId}`}
                    className="flex flex-col rounded-md no-underline hover:[&_span:first-child]:text-leaf hover:[&_span:first-child]:underline"
                  >
                    <span className="font-semibold text-ink">{item.name ?? item.username}</span>
                    <span className="text-sm text-ink-soft">@{item.username}</span>
                  </Link>
                </td>
                <td className="px-3 py-3"><RoleBadge role={item.role} label={t.shell.roles[item.role]} /></td>
                <td className="px-3 py-3 text-ink-soft">{position(item.position)}</td>
                <td className="px-3 py-3"><StatusBadge status={item.status} label={a.statuses[item.status]} /></td>
                <td className="tnum px-5 py-3 text-sm text-ink-soft">{lastLogin(item.lastLoginAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (phones) */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={item.userId}>
            <Link
              href={`/admin/accounts/${item.userId}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 no-underline shadow-[var(--shadow-soft)]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="flex flex-col">
                  <span className="truncate font-semibold text-ink">{item.name ?? item.username}</span>
                  <span className="truncate text-sm text-ink-soft">@{item.username}</span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <RoleBadge role={item.role} label={t.shell.roles[item.role]} />
                  <StatusBadge status={item.status} label={a.statuses[item.status]} />
                </span>
              </span>
              <CaretRightIcon weight="bold" aria-hidden className="size-5 shrink-0 text-ink-soft" />
            </Link>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav aria-label={format(a.page, { page: filters.page, pages })} className="flex items-center justify-between gap-3">
          <Button asChild variant="secondary" size="sm" className={filters.page <= 1 ? "pointer-events-none opacity-40" : ""}>
            <Link href={pageHref(filters.page - 1)} aria-disabled={filters.page <= 1}>
              <CaretLeftIcon weight="bold" aria-hidden />
              {a.prev}
            </Link>
          </Button>
          <span className="tnum text-sm text-ink-soft">{format(a.page, { page: filters.page, pages })}</span>
          <Button asChild variant="secondary" size="sm" className={filters.page >= pages ? "pointer-events-none opacity-40" : ""}>
            <Link href={pageHref(filters.page + 1)} aria-disabled={filters.page >= pages}>
              {a.next}
              <CaretRightIcon weight="bold" aria-hidden />
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
