import Link from "next/link";
import { ClockIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatShortDay } from "../format";
import { DASHBOARD_LINKS, motherPregnancyHref } from "../paths";
import type { DueSoonItem } from "../types";
import { DashCard } from "./dash-card";

// "Due within 30 days": a dashboard card of line-divided rows, past due
// first, then soonest. Each name opens her Pregnancy tab; "See all N" in the
// header opens the Mothers list with the same filter when there are more.
export function DueSoonList({ t, locale, items, total }: { t: Dictionary; locale: Locale; items: DueSoonItem[]; total: number }) {
  const d = t.dashboard.due;
  return (
    <DashCard
      id="dash-due"
      title={d.title}
      link={total > items.length ? { href: DASHBOARD_LINKS.dueSoon, label: format(d.seeAll, { count: total }) } : undefined}
    >
      {items.length === 0 ? (
        <p className="px-6 pt-3 pb-8 text-center text-ink-soft">{d.empty}</p>
      ) : (
        // Side by side only when the card has room (it is narrow beside the schedule).
        <ul className="@container divide-y divide-line px-5 pb-2 sm:px-6 sm:pb-3">
          {items.map((item) => (
            <li key={item.pregnancyId} className="flex flex-col gap-1 py-3 @[22rem]:flex-row @[22rem]:items-start @[22rem]:justify-between @[22rem]:gap-4">
              {/* The name keeps at least 45% of the row; long due lines wrap. */}
              <span className="min-w-0 @[22rem]:min-w-[45%] @[22rem]:flex-1">
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
              <span className="flex min-w-0 flex-col @[22rem]:items-end @[22rem]:text-right">
                <span className="tnum font-semibold text-ink">
                  {format(d.dueOn, { date: formatShortDay(item.dueDate, locale).replace(/ /g, "\u00a0") })}
                </span>
                <DaysLine t={t} daysLeft={item.daysLeft} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}

function DaysLine({ t, daysLeft }: { t: Dictionary; daysLeft: number }) {
  const d = t.dashboard.due;
  if (daysLeft < 0) {
    const days = -daysLeft;
    return (
      <span className="tnum inline-flex items-start gap-1 text-sm font-semibold text-rose-deep">
        <ClockIcon weight="bold" aria-hidden className="mt-0.5 size-4 shrink-0" />
        {days === 1 ? d.pastDueOne : format(d.pastDue, { days })}
      </span>
    );
  }
  const text = daysLeft === 0 ? d.dueToday : daysLeft === 1 ? d.tomorrow : format(d.inDays, { days: daysLeft });
  return <span className="tnum text-sm text-ink-soft">{text}</span>;
}
