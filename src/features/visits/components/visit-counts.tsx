import { AppointmentIcon, CalendarIcon, CheckCircleIcon, CheckupIcon } from "@/components/icons";
import { CountCards } from "@/components/shared/count-cards";
import type { Dictionary } from "@/i18n/get-dictionary";
import { weekOf } from "@/lib/utils/pregnancy";
import { NO_VISIT_FILTERS, visitsHref } from "../paths";
import type { VisitCounts as Counts } from "../types";

// The four counts above the Visits page: booked today and still to record
// (both open today's tickets below), recorded today and this week's visits
// (the list on those days).
export function VisitCounts({ t, counts, today }: { t: Dictionary; counts: Counts; today: string }) {
  const h = t.visits.hub;
  const week = weekOf(today);
  return (
    <CountCards
      label={h.label}
      cards={[
        { key: "booked", label: h.booked, count: counts.booked, href: "#today", icon: AppointmentIcon },
        { key: "toRecord", label: h.toRecord, count: counts.toRecord, href: "#today", icon: CheckupIcon },
        { key: "recorded", label: h.recorded, count: counts.recordedToday, href: visitsHref(NO_VISIT_FILTERS, { from: today, to: today }), icon: CheckCircleIcon },
        { key: "week", label: h.week, count: counts.week, href: visitsHref(NO_VISIT_FILTERS, { from: week[0], to: week[6] }), icon: CalendarIcon },
      ]}
    />
  );
}
