import Link from "next/link";
import { CaretRightIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { formatMonthOf } from "../format";
import { ACCOUNT_LINKS, ACCOUNTS_PATH } from "../paths";
import type { AccountCounts } from "../types";
import { DashCard } from "./dash-card";

// Admin: the accounts at a glance, as four milk figures in one card (two per
// row on phones and beside the SMS card, four across between): mothers with
// and without a login, this month's website sign-ups, staff, and logins that
// are switched off. A figure with a list behind it opens it.
export function AccountsStrip({ t, locale, counts, today }: { t: Dictionary; locale: Locale; counts: AccountCounts; today: string }) {
  const a = t.dashboard.admin.accounts;
  const s = t.dashboard.admin.accountsStrip;
  const cells: { label: string; value: number; line: string; href?: string }[] = [
    {
      label: a.mothers,
      value: counts.mothers,
      line: format(s.motherSplit, { with: counts.mothersWithLogin, without: counts.mothersWithoutLogin }),
      href: ACCOUNT_LINKS.mothers,
    },
    { label: s.signedUp, value: counts.signedUpThisMonth, line: format(s.signedUpIn, { month: formatMonthOf(today, locale) }) },
    {
      label: s.staff,
      value: counts.healthWorkers,
      line: counts.admins === 1 ? s.adminsOne : format(s.admins, { count: counts.admins }),
      href: ACCOUNT_LINKS.healthWorkers,
    },
    { label: s.inactive, value: counts.inactive, line: s.inactiveLine, href: ACCOUNT_LINKS.inactive },
  ];

  return (
    <DashCard id="dash-accounts" title={a.title} link={{ href: ACCOUNTS_PATH, label: t.shell.nav.accounts }}>
      <ul className="grid grid-cols-2 gap-3 px-5 pt-1 pb-5 sm:grid-cols-4 sm:px-6 sm:pb-6 xl:grid-cols-2">
        {cells.map((cell) => {
          const body = (
            <>
              <span className="text-sm leading-5 font-medium text-ink-soft">
                {cell.label}
                {cell.href && <CaretRightIcon weight="bold" aria-hidden className="ml-1 inline size-3.5 align-[-0.125em] text-leaf" />}
              </span>
              <span className="tnum mt-2 text-2xl leading-none font-extrabold tracking-[-0.02em] text-ink">{cell.value}</span>
              <span className="tnum mt-auto pt-2 text-sm leading-5 text-ink-soft">{cell.line}</span>
            </>
          );
          const box = "flex h-full flex-col rounded-xl bg-milk p-4";
          return (
            <li key={cell.label} className="min-w-0">
              {cell.href ? (
                <Link
                  href={cell.href}
                  className={cn(
                    box,
                    "no-underline transition-[background-color,transform] duration-200 ease-[var(--ease-out-expo)] hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid active:scale-[0.98]",
                  )}
                >
                  {body}
                </Link>
              ) : (
                <div className={box}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
