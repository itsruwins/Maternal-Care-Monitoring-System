import Link from "next/link";
import { ScrollActiveIntoView } from "@/components/shared/scroll-active-into-view";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { appointmentsListHref, LIST_TABS } from "../paths";
import type { AppointmentFilters, ListTabCounts } from "../types";

// All / Upcoming / Requested / Missed / Completed / Cancelled, each with its
// count (search, service and dates applied), as a row of pills above the
// list card. Switching keeps the search and filters; on phones the row
// scrolls sideways and keeps the current tab in view.
export function ListTabs({ t, filters, counts }: { t: Dictionary; filters: AppointmentFilters; counts: ListTabCounts }) {
  const tabs = t.appointments.list.tabs;
  return (
    <nav aria-label={tabs.label}>
      <ScrollActiveIntoView className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-24px),transparent)]">
        <ul className="flex w-max gap-1.5">
          {LIST_TABS.map((status) => {
            const key = status === "" ? "all" : status;
            const active = filters.status === status;
            return (
              <li key={key}>
                <Link
                  href={appointmentsListHref(filters, { status })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm whitespace-nowrap no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
                    active ? "border-leaf bg-leaf font-semibold text-white" : "border-line bg-white font-medium text-ink-soft hover:border-sage hover:text-ink",
                  )}
                >
                  {tabs[key]}
                  <span className={cn("tnum text-caption font-bold", active ? "text-white/85" : "text-ink-soft")}>{counts[key]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollActiveIntoView>
    </nav>
  );
}
