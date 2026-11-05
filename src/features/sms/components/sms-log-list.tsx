import Link from "next/link";
import { PhoneIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { recordSmsHref, smsLogQuery } from "../paths";
import { SMS_LOG_PAGE_SIZE } from "../queries/sms-log";
import type { SmsLogFilters, SmsLogItem } from "../types";
import { RetryButton } from "./retry-button";
import { SmsStatusChip, SmsStatusDetail, SmsText, smsAbout } from "./sms-bits";

type Shared = { t: Dictionary; locale: Locale; canRetry: boolean };

// The texts, newest first, inside the filter card: a table from 1280px
// (mother with her initials and the number, the text's type with what it is
// about and a one-line preview that unfolds, its status, Retry on a failed
// one), line-divided rows below. Her name opens the SMS tab of her record. A
// milk footer says which rows are shown and holds the pager (paging keeps the
// filters).
export function SmsLogList({ items, total, filters, ...shared }: Shared & { items: SmsLogItem[]; total: number; filters: SmsLogFilters }) {
  const { t, locale, canRetry } = shared;
  const l = t.sms.log;
  const hasFilters = Boolean(filters.q || filters.status || filters.type || filters.from || filters.to);
  if (items.length === 0) return <p className="px-6 py-12 text-center text-ink-soft">{hasFilters ? l.empty : l.emptyAll}</p>;

  const pages = Math.max(1, Math.ceil(total / SMS_LOG_PAGE_SIZE));
  const first = (filters.page - 1) * SMS_LOG_PAGE_SIZE + 1;

  return (
    <>
      {/* Table (1280px and up) */}
      <table className="w-full text-left text-[0.95rem] max-xl:hidden">
        <thead className="bg-milk text-caption text-ink-soft">
          <tr className="border-b border-line">
            <th scope="col" className="py-3 pr-3 pl-6 font-semibold">{l.columns.mother}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.text}</th>
            <th scope="col" className="px-3 py-3 font-semibold">{l.columns.status}</th>
            {canRetry && (
              <th scope="col" className="py-3 pr-6">
                <span className="sr-only">{l.columns.actions}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="align-top transition-colors hover:bg-milk/70">
              <td className="w-[27%] py-4 pr-3 pl-6">
                <span className="flex items-start gap-3">
                  <MotherInitials name={item.mother.name} />
                  <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                    <MotherLink item={item} />
                    <SmsNumber t={t} item={item} />
                  </span>
                </span>
              </td>
              <td className="px-3 py-4">
                <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                  <span className="font-medium">{l.types[item.type]}</span>
                  <span className="tnum text-sm text-ink-soft">{smsAbout(t, locale, item)}</span>
                  <SmsText text={item.text} className="mt-2 max-w-[46ch]" />
                </span>
              </td>
              <td className="w-[23%] px-3 py-4">
                <span className="flex flex-col items-start gap-1 pt-0.5">
                  <SmsStatusChip t={t} item={item} />
                  <SmsStatusDetail t={t} locale={locale} item={item} />
                </span>
              </td>
              {canRetry && (
                <td className="w-px py-4 pr-6 text-right">
                  {item.status === "FAILED" && <RetryButton reminderId={item.id} motherName={item.mother.name} />}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rows (below 1280px) */}
      <ul className="divide-y divide-line xl:hidden">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 px-4 py-4 sm:px-6">
            <MotherInitials name={item.mother.name} />
            <SmsRowBody {...shared} item={item} showMother />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-line bg-milk px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="tnum text-sm text-ink-soft">{format(l.showing, { from: first, to: first + items.length - 1, total })}</p>
        <Pager page={filters.page} pages={pages} hrefFor={(page) => smsLogQuery(filters, { page })} labels={{ prev: l.prev, next: l.next, page: l.page }} />
      </div>
    </>
  );
}

/**
 * One text as a card, for her record's SMS log tab: the same body as a list
 * row, without her name.
 */
export function SmsCard({ item, ...shared }: Shared & { item: SmsLogItem }) {
  return (
    <article className="flex h-full rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <SmsRowBody {...shared} item={item} showMother={false} />
    </article>
  );
}

/** Her name (when shown) or the type, with the status chip at the end; what it's about, the number, the preview, the status line and Retry. */
function SmsRowBody({ t, locale, canRetry, item, showMother }: Shared & { item: SmsLogItem; showMother: boolean }) {
  const l = t.sms.log;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex items-start justify-between gap-3">
        {showMother ? <MotherLink item={item} className="min-w-0 pt-0.5" /> : <span className="pt-0.5 font-semibold">{l.types[item.type]}</span>}
        <SmsStatusChip t={t} item={item} />
      </div>
      {showMother && <span className="font-medium">{l.types[item.type]}</span>}
      <span className="tnum text-sm text-ink-soft">{smsAbout(t, locale, item)}</span>
      {showMother && <SmsNumber t={t} item={item} />}
      <SmsText text={item.text} className="mt-2" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="flex flex-col">
          <SmsStatusDetail t={t} locale={locale} item={item} />
        </span>
        {canRetry && item.status === "FAILED" && <RetryButton reminderId={item.id} motherName={item.mother.name} />}
      </div>
    </div>
  );
}

function MotherLink({ item, className }: { item: SmsLogItem; className?: string }) {
  return (
    <Link href={recordSmsHref(item.mother.id)} className={cn("self-start font-semibold break-words text-ink no-underline hover:text-leaf hover:underline", className)}>
      {item.mother.name}
    </Link>
  );
}

/** The number it goes or went to, on one line beside the phone icon ("To" for screen readers). */
function SmsNumber({ t, item }: { t: Dictionary; item: SmsLogItem }) {
  const [before, after] = t.sms.log.to.split("{number}");
  return (
    <span className="tnum inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-ink-soft">
      <PhoneIcon aria-hidden className="size-4 shrink-0" />
      {before && <span className="sr-only">{before}</span>}
      {item.number}
      {after && <span className="sr-only">{after}</span>}
    </span>
  );
}
