import Link from "next/link";
import { AppointmentIcon, CalendarIcon, CallIcon, CaretRightIcon, CheckupIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { weekOf } from "@/lib/utils/pregnancy";
import { appointmentsListHref, NO_LIST_FILTERS } from "../paths";
import type { HubCounts as Counts } from "../types";

// Four counts above the views, each opening the list behind it: waiting
// requests (the Requests view), today and this week (the List on those days),
// missed visits still to follow up (Follow-ups). Requests and missed turn
// rose-deep above zero (they need someone). Two per row on phones.
export function HubCounts({ t, counts, today }: { t: Dictionary; counts: Counts; today: string }) {
  const h = t.appointments.hub;
  const week = weekOf(today);
  const cards: { key: keyof Counts; href: string; icon: Icon; alert: boolean }[] = [
    { key: "requests", href: "?", icon: AppointmentIcon, alert: counts.requests > 0 },
    { key: "today", href: appointmentsListHref(NO_LIST_FILTERS, { from: today, to: today }), icon: CheckupIcon, alert: false },
    { key: "week", href: appointmentsListHref(NO_LIST_FILTERS, { from: week[0], to: week[6] }), icon: CalendarIcon, alert: false },
    { key: "missed", href: "/staff/follow-ups", icon: CallIcon, alert: counts.missed > 0 },
  ];
  return (
    <nav aria-label={h.label}>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ key, href, icon, alert }) => (
          <li key={key} className="min-w-0">
            <Link
              href={href}
              scroll={false}
              className="group flex h-full items-start justify-between gap-3 rounded-2xl border-2 border-transparent bg-white p-4 no-underline shadow-[var(--shadow-soft)] transition-[border-color,transform] duration-200 ease-[var(--ease-out-expo)] hover:border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid active:scale-[0.98] sm:p-5"
            >
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className={cn("tnum text-[1.75rem] leading-none font-extrabold tracking-[-0.02em]", alert ? "text-rose-deep" : "text-ink")}>
                  {counts[key]}
                </span>
                <span className="text-sm font-medium text-ink-soft">
                  {h[key]}
                  <CaretRightIcon
                    weight="bold"
                    aria-hidden
                    className="ml-1 inline size-3.5 align-[-0.125em] text-leaf transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  />
                </span>
              </span>
              <IconCircle icon={icon} tone={alert ? "blush" : "mint"} size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
