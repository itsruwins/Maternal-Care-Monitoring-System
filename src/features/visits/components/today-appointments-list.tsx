import Link from "next/link";
import { CheckCircleIcon, CheckupIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock } from "@/lib/appointments/format";
import type { TodayAppointment } from "../types";

// Today's appointments on the Visits page as cards, two per row from 768px:
// time tile, mother, service, and Record visit (or a link to the visit once
// recorded). The staff dashboard shows them as a table (TodayScheduleTable).
export function TodayAppointmentsList({ t, locale, items }: { t: Dictionary; locale: Locale; items: TodayAppointment[] }) {
  const v = t.visits;
  if (items.length === 0) {
    return <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{v.todayEmpty}</p>;
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
          <span className="tnum grid h-14 w-20 shrink-0 place-items-center rounded-2xl bg-mint text-[0.95rem] font-bold text-leaf">
            {formatSlotClock(item.at, locale)}
          </span>
          <span className="min-w-0 flex-1">
            <Link
              href={`/staff/mothers/${item.mother.id}`}
              className="block font-semibold break-words text-ink no-underline hover:text-leaf hover:underline"
            >
              {item.mother.name}
            </Link>
            <span className="block text-sm break-words text-ink-soft">{item.service}</span>
          </span>
          {item.visitId || item.dayVisitId ? (
            <Link
              href={`/staff/visits/${item.visitId ?? item.dayVisitId}`}
              className="inline-flex w-full shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 sm:w-auto"
            >
              <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
              {item.visitId ? v.recorded : v.completedAtVisit}
            </Link>
          ) : item.status === "COMPLETED" ? (
            <span className="inline-flex w-full shrink-0 items-center gap-1.5 text-sm font-semibold text-leaf sm:w-auto">
              <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
              {t.appointments.statuses.COMPLETED}
            </span>
          ) : (
            <Button asChild size="sm" className="h-11 w-full shrink-0 sm:h-9 sm:w-auto">
              <Link href={`/staff/visits/new?appointment=${item.id}`}>
                <CheckupIcon weight="bold" aria-hidden />
                {v.record}
              </Link>
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
