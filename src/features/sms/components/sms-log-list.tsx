import Link from "next/link";
import { PhoneIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { recordSmsHref, smsLogHref } from "../paths";
import { SMS_LOG_PAGE_SIZE } from "../queries/sms-log";
import type { SmsLogFilters, SmsLogItem } from "../types";
import { RetryButton } from "./retry-button";
import { SmsStatusChip, SmsStatusDetail, SmsText, smsAbout } from "./sms-bits";

type Shared = { t: Dictionary; locale: Locale; canRetry: boolean };

// The texts, newest first: a table from 1280px, cards below (two columns from
// 768px). Paging keeps the filters.
export function SmsLogList({ items, total, filters, ...shared }: Shared & { items: SmsLogItem[]; total: number; filters: SmsLogFilters }) {
  const { t, locale, canRetry } = shared;
  const l = t.sms.log;
  const hasFilters = Boolean(filters.q || filters.status || filters.type || filters.from || filters.to);
  const pages = Math.max(1, Math.ceil(total / SMS_LOG_PAGE_SIZE));

  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{hasFilters ? l.empty : l.emptyAll}</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">{total === 1 ? l.countOne : format(l.count, { count: total })}</p>

      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] xl:block">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="border-b border-line text-caption font-semibold text-ink-soft">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">{l.columns.mother}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{l.columns.text}</th>
              <th scope="col" className="px-3 py-3.5 font-semibold">{l.columns.status}</th>
              {canRetry && (
                <th scope="col" className="px-5 py-3.5">
                  <span className="sr-only">{l.columns.actions}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="w-[28%] px-5 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <Link href={recordSmsHref(item.mother.id)} className="font-semibold text-ink no-underline hover:text-leaf hover:underline">
                      {item.mother.name}
                    </Link>
                    <span className="tnum inline-flex items-center gap-1.5 text-sm text-ink-soft">
                      <PhoneIcon aria-hidden className="size-4" />
                      {format(l.to, { number: item.number })}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <p className="font-medium">{l.types[item.type]}</p>
                    <p className="tnum text-sm text-ink-soft">{smsAbout(t, locale, item)}</p>
                    <SmsText t={t} text={item.text} />
                  </div>
                </td>
                <td className="w-[24%] px-3 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <SmsStatusChip t={t} item={item} />
                    <SmsStatusDetail t={t} locale={locale} item={item} />
                  </div>
                </td>
                {canRetry && (
                  <td className="w-px px-5 py-4">
                    {item.status === "FAILED" && <RetryButton reminderId={item.id} motherName={item.mother.name} />}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <SmsCard {...shared} item={item} showMother />
          </li>
        ))}
      </ul>

      <Pager page={filters.page} pages={pages} hrefFor={(page) => smsLogHref(filters, { page })} labels={{ prev: l.prev, next: l.next, page: l.page }} />
    </div>
  );
}

/** One text as a card (phones and tablets, and her record's SMS log tab). */
export function SmsCard({ t, locale, canRetry, item, showMother }: Shared & { item: SmsLogItem; showMother: boolean }) {
  const l = t.sms.log;
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col items-start gap-1">
        <SmsStatusChip t={t} item={item} />
        <SmsStatusDetail t={t} locale={locale} item={item} />
      </div>
      <div className="flex flex-col items-start gap-1 border-t border-line pt-3">
        {showMother && (
          <Link href={recordSmsHref(item.mother.id)} className="font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
            {item.mother.name}
          </Link>
        )}
        <p className={showMother ? "font-medium" : "font-semibold"}>{l.types[item.type]}</p>
        <p className="tnum text-sm text-ink-soft">{smsAbout(t, locale, item)}</p>
        <p className="tnum inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <PhoneIcon aria-hidden className="size-4" />
          {format(l.to, { number: item.number })}
        </p>
        <SmsText t={t} text={item.text} />
      </div>
      {canRetry && item.status === "FAILED" && (
        <div className="mt-auto pt-1">
          <RetryButton reminderId={item.id} motherName={item.mother.name} className="h-11 w-full" />
        </div>
      )}
    </article>
  );
}
