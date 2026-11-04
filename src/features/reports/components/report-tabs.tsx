import { PillTabs } from "@/components/shared/pill-tabs";
import type { Dictionary } from "@/i18n/get-dictionary";
import { REPORT_TABS, SERVICE_TABS } from "../period";
import { reportsHref } from "../paths";
import type { ReportFilters } from "../types";

// Summary, then the detail tabs, as the outlined pills of the other lists
// (no counts: a detail tab's count depends on its own filters). The period
// and purok carry over; the service only to tabs that use it. SMS is for
// admins only.
export function ReportTabs({ t, filters, isAdmin }: { t: Dictionary; filters: ReportFilters; isAdmin: boolean }) {
  const r = t.reports;
  return (
    <PillTabs
      label={r.tabsLabel}
      tabs={REPORT_TABS.filter((tab) => tab !== "sms" || isAdmin).map((tab) => ({
        key: tab,
        label: r.tabs[tab],
        href: reportsHref(filters, { tab, service: SERVICE_TABS.has(tab) ? filters.service : "", show: "", status: "", type: "" }),
        active: tab === filters.tab,
      }))}
    />
  );
}
