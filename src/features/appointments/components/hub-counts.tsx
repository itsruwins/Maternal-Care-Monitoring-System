import { AppointmentIcon, CalendarIcon, CallIcon, CheckupIcon } from "@/components/icons";
import { CountCards } from "@/components/shared/count-cards";
import type { Dictionary } from "@/i18n/get-dictionary";
import { weekOf } from "@/lib/utils/pregnancy";
import { appointmentsListHref, NO_LIST_FILTERS } from "../paths";
import type { HubCounts as Counts } from "../types";

// The four counts above the appointment views: waiting requests (the
// Requests view), today and this week (the List on those days), missed
// visits still to follow up (Follow-ups). Requests and missed need someone.
export function HubCounts({ t, counts, today }: { t: Dictionary; counts: Counts; today: string }) {
  const h = t.appointments.hub;
  const week = weekOf(today);
  return (
    <CountCards
      label={h.label}
      cards={[
        { key: "requests", label: h.requests, count: counts.requests, href: "?", icon: AppointmentIcon, alert: counts.requests > 0 },
        { key: "today", label: h.today, count: counts.today, href: appointmentsListHref(NO_LIST_FILTERS, { from: today, to: today }), icon: CheckupIcon },
        { key: "week", label: h.week, count: counts.week, href: appointmentsListHref(NO_LIST_FILTERS, { from: week[0], to: week[6] }), icon: CalendarIcon },
        { key: "missed", label: h.missed, count: counts.missed, href: "/staff/follow-ups", icon: CallIcon, alert: counts.missed > 0 },
      ]}
    />
  );
}
