import { PillTabs } from "@/components/shared/pill-tabs";
import type { Dictionary } from "@/i18n/get-dictionary";
import { appointmentsListHref, LIST_TABS } from "../paths";
import type { AppointmentFilters, ListTabCounts } from "../types";

// All / Upcoming / Requested / Missed / Completed / Cancelled, each with its
// count (search, service and dates applied). Switching keeps the search and
// filters.
export function ListTabs({ t, filters, counts }: { t: Dictionary; filters: AppointmentFilters; counts: ListTabCounts }) {
  const tabs = t.appointments.list.tabs;
  return (
    <PillTabs
      label={tabs.label}
      tabs={LIST_TABS.map((status) => {
        const key = status === "" ? "all" : status;
        return { key, label: tabs[key], count: counts[key], href: appointmentsListHref(filters, { status }), active: filters.status === status };
      })}
    />
  );
}
