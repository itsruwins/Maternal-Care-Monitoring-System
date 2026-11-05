import Link from "next/link";
import { CaretRightIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { ACCOUNTS_PAGE_SIZE, positionKeyOf } from "../constants";
import { accountHref, accountsHref } from "../paths";
import type { AccountFilters, AccountListItem } from "../types";
import { AccountInitials, LastLogin } from "./account-bits";
import { RoleBadge, StatusBadge } from "./badges";

// The accounts list, inside the toolbar card: a table from 1280px (name with
// initials and username, role, position, status, last login, a caret), and
// line-divided rows below. The whole row opens the account (its name is the
// one link, stretched over the row). The last login reads "Today, 7:14 PM",
// "Yesterday, …", "3 days ago" or a date (the exact time on hover); "Never
// logged in" is a quiet cream chip. A turned-off account is dimmed. A milk
// footer says which rows are shown and holds the pager.
export function AccountsList({
  t,
  locale,
  items,
  total,
  filters,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  items: AccountListItem[];
  total: number;
  filters: AccountFilters;
  today: string;
}) {
  const a = t.accounts;
  if (items.length === 0) return <p className="px-6 py-12 text-center text-ink-soft">{a.empty}</p>;

  const pages = Math.max(1, Math.ceil(total / ACCOUNTS_PAGE_SIZE));
  const first = (filters.page - 1) * ACCOUNTS_PAGE_SIZE + 1;
  const position = (value: string | null) => {
    if (!value) return null;
    const key = positionKeyOf(value);
    return key === "other" ? value : a.positions[key];
  };

  return (
    <>
      {/* Table (1280px and up; with the sidebar, 1024px is too narrow for six columns in Filipino) */}
      <table className="w-full text-left text-[0.95rem] max-xl:hidden">
        <thead className="bg-milk text-caption text-ink-soft">
          <tr className="border-b border-line">
            <th scope="col" className="py-3 pr-3 pl-6 font-semibold">{a.columns.name}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{a.columns.role}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{a.columns.position}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{a.columns.status}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{a.columns.lastLogin}</th>
            <th scope="col" className="w-12 py-3 pr-6">
              <span className="sr-only">{a.columns.name}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => {
            const off = item.status === "INACTIVE";
            const name = item.name ?? item.username;
            return (
              <tr key={item.userId} className="group relative transition-colors hover:bg-milk/70">
                <td className="min-w-[14rem] py-3 pr-3 pl-6">
                  <span className="flex items-center gap-3">
                    <AccountInitials name={name} role={item.role} off={off} />
                    <span className="flex min-w-0 flex-col">
                      <RowLink href={accountHref(item.userId)} className={cn("self-start group-hover:text-leaf", off && "text-ink-soft")}>
                        {name}
                      </RowLink>
                      <span className="text-sm break-all text-ink-soft">@{item.username}</span>
                    </span>
                  </span>
                </td>
                <td className={cn("px-3 py-3", off && "opacity-70")}>
                  <RoleBadge role={item.role} label={t.shell.roles[item.role]} />
                </td>
                <td className="min-w-36 px-3 py-3 text-ink-soft">{position(item.position) ?? "—"}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={item.status} label={a.statuses[item.status]} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <LastLogin t={t} locale={locale} at={item.lastLoginAt} today={today} />
                </td>
                <td className="py-3 pr-6 text-right">
                  <CaretRightIcon
                    weight="bold"
                    aria-hidden
                    className="inline size-4 text-ink-soft transition-[color,transform] duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:text-leaf"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Rows (below 1280px) */}
      <ul className="divide-y divide-line xl:hidden">
        {items.map((item) => {
          const off = item.status === "INACTIVE";
          const name = item.name ?? item.username;
          const role = position(item.position);
          return (
            <li key={item.userId} className="relative flex items-start gap-3 px-4 py-4 transition-colors active:bg-milk sm:px-6">
              <AccountInitials name={name} role={item.role} off={off} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-start justify-between gap-3">
                  <RowLink href={accountHref(item.userId)} className={cn("min-w-0", off && "text-ink-soft")}>
                    {name}
                  </RowLink>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <RoleBadge role={item.role} label={t.shell.roles[item.role]} />
                    <CaretRightIcon weight="bold" aria-hidden className="size-3.5 text-leaf" />
                  </span>
                </span>
                <span className="text-sm break-all text-ink-soft">@{item.username}</span>
                {role && <span className="text-sm text-ink">{role}</span>}
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  {off && <StatusBadge status={item.status} label={a.statuses[item.status]} />}
                  <span className="inline-flex flex-wrap items-center gap-x-1.5">
                    {item.lastLoginAt && <span className="text-ink-soft">{a.columns.lastLogin}</span>}
                    <LastLogin t={t} locale={locale} at={item.lastLoginAt} today={today} />
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-line bg-milk px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="tnum text-sm text-ink-soft">{format(a.showing, { from: first, to: first + items.length - 1, total })}</p>
        <Pager page={filters.page} pages={pages} hrefFor={(page) => accountsHref(filters, { page })} labels={{ prev: a.prev, next: a.next, page: a.page }} />
      </div>
    </>
  );
}

/** The account's name: the one link in its row, stretched over the whole row. */
function RowLink({ href, className, children }: { href: string; className?: string; children: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "font-semibold break-words text-ink no-underline after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-leaf focus-visible:after:outline-solid",
        className,
      )}
    >
      {children}
    </Link>
  );
}
