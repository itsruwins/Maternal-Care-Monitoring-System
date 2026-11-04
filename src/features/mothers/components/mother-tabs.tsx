import Link from "next/link";
import { ScrollActiveIntoView } from "@/components/shared/scroll-active-into-view";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { mothersHref, tabKeepsDueMonth } from "../paths";
import type { MotherFilters, MotherStatusFilter, MotherTabCounts } from "../types";

const TABS: { status: MotherStatusFilter; key: keyof MotherTabCounts }[] = [
  { status: "", key: "all" },
  { status: "pregnant", key: "pregnant" },
  { status: "dueSoon", key: "dueSoon" },
  { status: "notPregnant", key: "notPregnant" },
];

// All / Pregnant / Due within 30 days / Not pregnant, in the record-tab
// style, each with its count (search and purok applied). Switching keeps the
// search, purok and order; on phones the bar scrolls sideways and keeps the
// current tab in view.
export function MotherTabs({ t, filters, counts }: { t: Dictionary; filters: MotherFilters; counts: MotherTabCounts }) {
  const tabs = t.mothers.tabs;
  return (
    <nav aria-label={tabs.label}>
      <ScrollActiveIntoView className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-24px),transparent)]">
        <ul className="flex w-max gap-1 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
          {TABS.map(({ status, key }) => {
            const active = filters.status === status;
            return (
              <li key={key}>
                <Link
                  href={mothersHref(filters, { status, due: tabKeepsDueMonth(status) ? filters.due : "" })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {tabs[key]}
                  <span
                    className={cn(
                      "tnum grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-caption font-bold",
                      active ? "bg-white text-leaf" : "bg-cream text-ink-soft",
                    )}
                  >
                    {counts[key]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollActiveIntoView>
    </nav>
  );
}
