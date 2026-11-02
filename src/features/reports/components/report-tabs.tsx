import Link from "next/link";
import { ScrollActiveIntoView } from "@/components/shared/scroll-active-into-view";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { REPORT_TABS, SERVICE_TABS } from "../period";
import { reportsHref } from "../paths";
import type { ReportFilters } from "../types";

// Summary, then the detail tabs, as link tabs in the record-tab style. The
// period and purok carry over; the service only to tabs that use it. SMS is
// for admins only. On phones the bar scrolls sideways: the current tab is
// scrolled into view and the edges fade to show there's more.
export function ReportTabs({ t, filters, isAdmin }: { t: Dictionary; filters: ReportFilters; isAdmin: boolean }) {
  const r = t.reports;
  const tabs = REPORT_TABS.filter((tab) => tab !== "sms" || isAdmin);
  return (
    <nav aria-label={r.tabsLabel}>
      <ScrollActiveIntoView className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-24px),transparent)]">
        <ul className="flex w-max gap-1 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
          {tabs.map((tab) => {
            const active = tab === filters.tab;
            return (
              <li key={tab}>
                <Link
                  href={reportsHref(filters, { tab, service: SERVICE_TABS.has(tab) ? filters.service : "", show: "", status: "", type: "" })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {r.tabs[tab]}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollActiveIntoView>
    </nav>
  );
}
