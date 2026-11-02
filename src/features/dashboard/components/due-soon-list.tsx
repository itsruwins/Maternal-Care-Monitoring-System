import Link from "next/link";
import { CaretRightIcon, ClockIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatShortDay } from "../format";
import { DASHBOARD_LINKS, motherPregnancyHref } from "../paths";
import type { DueSoonItem } from "../types";

// "Due within 30 days": one card of line-divided rows, past due first, then
// soonest. Each name opens her Pregnancy tab; "See all N" opens the Mothers
// list with the same filter when there are more than shown.
export function DueSoonList({ t, locale, items, total }: { t: Dictionary; locale: Locale; items: DueSoonItem[]; total: number }) {
  const d = t.dashboard.due;
  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{d.empty}</p>;
  }
  return (
    <div className="rounded-3xl bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={item.pregnancyId} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <span className="min-w-0">
              <Link
                href={motherPregnancyHref(item.motherId)}
                className="block font-semibold break-words text-ink no-underline hover:text-leaf hover:underline"
              >
                {item.name}
              </Link>
              <span className="block text-sm text-ink-soft">
                {[item.purok ?? d.noPurok, item.weeks !== null ? format(d.week, { weeks: item.weeks }) : null].filter(Boolean).join(" · ")}
              </span>
            </span>
            <span className="flex shrink-0 flex-col sm:items-end">
              <span className="tnum font-semibold text-ink">{format(d.dueOn, { date: formatShortDay(item.dueDate, locale) })}</span>
              <DaysLine t={t} daysLeft={item.daysLeft} />
            </span>
          </li>
        ))}
      </ul>
      {total > items.length && (
        <p className="border-t border-line py-3.5">
          <Link
            href={DASHBOARD_LINKS.dueSoon}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {format(d.seeAll, { count: total })}
            <CaretRightIcon weight="bold" aria-hidden className="size-3.5" />
          </Link>
        </p>
      )}
    </div>
  );
}

function DaysLine({ t, daysLeft }: { t: Dictionary; daysLeft: number }) {
  const d = t.dashboard.due;
  if (daysLeft < 0) {
    const days = -daysLeft;
    return (
      <span className="tnum inline-flex items-center gap-1 text-sm font-semibold text-rose-deep">
        <ClockIcon weight="bold" aria-hidden className="size-4 shrink-0" />
        {days === 1 ? d.pastDueOne : format(d.pastDue, { days })}
      </span>
    );
  }
  const text = daysLeft === 0 ? d.dueToday : daysLeft === 1 ? d.tomorrow : format(d.inDays, { days: daysLeft });
  return <span className="tnum text-sm text-ink-soft">{text}</span>;
}
