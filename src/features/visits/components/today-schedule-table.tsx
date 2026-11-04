import Link from "next/link";
import { CheckCircleIcon, CheckupIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock } from "@/lib/appointments/format";
import type { TodayAppointment } from "../types";

// Today's appointments for the staff dashboard, inside its "Today's schedule"
// card: a table from 768px (time, mother, service, the visit action on the
// right), line-divided rows below it with the action under the name. Same
// states as the Visits page cards: Record visit, or a leaf link once recorded.
// A missed one says so in rose-deep under its service.
export function TodayScheduleTable({ t, locale, items }: { t: Dictionary; locale: Locale; items: TodayAppointment[] }) {
  const v = t.visits;
  const s = t.dashboard.schedule;
  if (items.length === 0) {
    return <p className="px-6 pt-3 pb-8 text-center text-ink-soft">{v.todayEmpty}</p>;
  }
  return (
    <div className="px-5 pb-2 sm:px-6 sm:pb-3">
      {/* Table from 768px */}
      <table className="w-full text-left text-[0.95rem] max-md:hidden">
        <thead className="text-caption text-ink-soft">
          <tr className="border-b border-line">
            <th scope="col" className="w-24 py-2.5 pr-4 font-semibold whitespace-nowrap">
              {s.time}
            </th>
            <th scope="col" className="py-2.5 pr-4 font-semibold whitespace-nowrap">
              {s.mother}
            </th>
            <th scope="col" className="py-2.5 pr-4 font-semibold whitespace-nowrap">
              {s.service}
            </th>
            <th scope="col" className="py-2.5 text-right font-semibold whitespace-nowrap">
              {s.visit}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="align-middle">
              <td className="tnum py-3 pr-4 font-semibold whitespace-nowrap text-ink">{formatSlotClock(item.at, locale)}</td>
              <td className="py-3 pr-4">
                <MotherLink item={item} />
              </td>
              <td className="py-3 pr-4 text-ink-soft">
                {item.service}
                {item.status === "MISSED" && <span className="block text-sm font-semibold text-rose-deep">{t.appointments.statuses.MISSED}</span>}
              </td>
              <td className="py-3 text-right">
                <VisitAction t={t} item={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rows below 768px */}
      <ul className="divide-y divide-line md:hidden">
        {items.map((item) => (
          <li key={item.id} className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 py-3.5">
            <span className="tnum pt-px font-semibold whitespace-nowrap text-ink">{formatSlotClock(item.at, locale)}</span>
            <span className="min-w-0">
              <MotherLink item={item} />
              <span className="block text-sm break-words text-ink-soft">{item.service}</span>
              {item.status === "MISSED" && <span className="block text-sm font-semibold text-rose-deep">{t.appointments.statuses.MISSED}</span>}
            </span>
            <span className="col-start-2">
              <VisitAction t={t} item={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MotherLink({ item }: { item: TodayAppointment }) {
  return (
    <Link href={`/staff/mothers/${item.mother.id}`} className="block font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
      {item.mother.name}
    </Link>
  );
}

function VisitAction({ t, item }: { t: Dictionary; item: TodayAppointment }) {
  const v = t.visits;
  if (item.visitId || item.dayVisitId) {
    return (
      <Link
        href={`/staff/visits/${item.visitId ?? item.dayVisitId}`}
        className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
        {item.visitId ? v.recorded : v.completedAtVisit}
      </Link>
    );
  }
  if (item.status === "COMPLETED") {
    return (
      <span className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-leaf">
        <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
        {t.appointments.statuses.COMPLETED}
      </span>
    );
  }
  return (
    <Button asChild size="sm" className="h-11 w-full md:h-9 md:w-auto">
      <Link href={`/staff/visits/new?appointment=${item.id}`}>
        <CheckupIcon weight="bold" aria-hidden />
        {v.record}
      </Link>
    </Button>
  );
}
