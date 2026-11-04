import Link from "next/link";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import { recordFollowUpsHref } from "@/features/follow-ups/paths";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { cn } from "@/lib/utils/cn";
import { addDays } from "@/lib/utils/pregnancy";
import { motherAppointmentsHref } from "../paths";
import type { SlotData, StaffAppointment } from "../types";
import { AppointmentRowActions } from "./appointment-actions";
import { DatePassedLine, ReminderLine, StatusChip, requestPassed } from "./appointment-bits";

type Props = {
  t: Dictionary;
  locale: Locale;
  items: StaffAppointment[];
  slots: SlotData;
  /** Manila date: "Today" / "Tomorrow" headings and Record visit. */
  today: string;
  /** The current instant (ISO), for "Date passed". */
  now: string;
  isAdmin?: boolean;
  /** Group under day headings (the List). Off for one day (the calendar). */
  grouped?: boolean;
  /** Always the stacked rows, also on wide screens (narrow panels). */
  stacked?: boolean;
};

// Appointments as line-divided rows inside a card. From 1280px a table (time,
// mother with initials, service, status with the reminder line, then the next
// step and a ⋯ menu); below that, or in a narrow panel, stacked rows in the
// same order (the ⋯ menu beside the status chip, the next step at the
// bottom). In the List the rows sit under day headings: "Today ·
// Wednesday, November 4", "Tomorrow · …", or the date alone.
export function AppointmentRows({ t, locale, items, slots, today, now, isAdmin = false, grouped = true, stacked = false }: Props) {
  const groups = grouped ? byDay(items) : [{ date: "", items }];
  const heading = (date: string, at: string) => {
    const l = t.appointments.list;
    const relative = date === today ? l.today : date === addDays(today, 1) ? l.tomorrow : date === addDays(today, -1) ? l.yesterday : null;
    const long = formatSlotDate(at, locale);
    return relative ? `${relative} · ${long}` : long;
  };

  return (
    <>
      {!stacked && (
        <table className="w-full text-left text-[0.95rem] max-xl:hidden">
          <thead className="bg-milk text-caption text-ink-soft">
            <tr className="border-b border-line">
              <th scope="col" className="w-28 py-3 pr-3 pl-6 font-semibold">{t.appointments.list.time}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t.appointments.list.columns.mother}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t.appointments.list.columns.service}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t.appointments.list.columns.status}</th>
              <th scope="col" className="py-3 pr-4 pl-3">
                <span className="sr-only">{t.appointments.menu.openRecord}</span>
              </th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.date || "all"} className="border-b border-line last:border-b-0">
              {grouped && (
                <tr>
                  <th colSpan={5} scope="rowgroup" className="px-6 pt-5 pb-2 text-left text-sm font-bold text-ink">
                    {heading(group.date, group.items[0].at)}
                  </th>
                </tr>
              )}
              {group.items.map((item) => (
                <tr key={item.id} className="border-t border-line align-top transition-colors first:border-t-0 hover:bg-milk/70">
                  <td className="tnum py-4 pr-3 pl-6 font-semibold whitespace-nowrap text-ink">{formatSlotClock(item.at, locale)}</td>
                  <td className="min-w-[13rem] px-3 py-3">
                    <Mother item={item} />
                  </td>
                  <td className="px-3 py-4">{item.service}</td>
                  <td className="px-3 py-3.5">
                    <Status t={t} locale={locale} item={item} now={now} isAdmin={isAdmin} />
                  </td>
                  <td className="py-3 pr-4 pl-3 whitespace-nowrap">
                    <Actions item={item} slots={slots} today={today} now={now} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      )}

      <div className={cn(!stacked && "xl:hidden")}>
        {groups.map((group) => (
          <section key={group.date || "all"} className="border-b border-line last:border-b-0">
            {grouped && <h3 className="bg-milk px-4 py-2.5 text-sm font-bold text-ink sm:px-6">{heading(group.date, group.items[0].at)}</h3>}
            <ul className="divide-y divide-line">
              {group.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 pt-1">
                      <span className="tnum font-semibold text-ink">{formatSlotClock(item.at, locale)}</span>
                      <span className="text-ink-soft"> · {item.service}</span>
                    </p>
                    <span className="-mr-2 flex shrink-0 items-center gap-1">
                      <StatusChip t={t} status={item.status} />
                      <Actions item={item} slots={slots} today={today} now={now} part="menu" />
                    </span>
                  </div>
                  <Mother item={item} />
                  <Status t={t} locale={locale} item={item} now={now} isAdmin={isAdmin} chip={false} />
                  {hasNextStep(item, today, now) && <Actions item={item} slots={slots} today={today} now={now} part="primary" className="justify-start" />}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function byDay(items: StaffAppointment[]) {
  const groups: { date: string; items: StaffAppointment[] }[] = [];
  for (const item of items) {
    const date = manilaSlot(item.at).date;
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.items.push(item);
    else groups.push({ date, items: [item] });
  }
  return groups;
}

function Mother({ item }: { item: StaffAppointment }) {
  return (
    <span className="flex items-center gap-3">
      <MotherInitials name={item.mother.name} />
      <span className="flex min-w-0 flex-col">
        <Link
          href={motherAppointmentsHref(item.mother.id)}
          className="self-start font-semibold break-words text-ink no-underline hover:text-leaf hover:underline"
        >
          {item.mother.name}
        </Link>
        <span className="tnum text-sm text-ink-soft">{item.mother.contactNumber}</span>
      </span>
    </span>
  );
}

/** The status chip (the stacked rows show it beside the time), date passed, a new time waiting on her, the reminder. */
function Status({
  t,
  locale,
  item,
  now,
  isAdmin,
  chip = true,
}: {
  t: Dictionary;
  locale: Locale;
  item: StaffAppointment;
  now: string;
  isAdmin: boolean;
  chip?: boolean;
}) {
  const passed = requestPassed(item, now);
  const lines = (
    <>
      {passed && <DatePassedLine t={t} />}
      {item.status === "RESCHEDULED" && <p className="text-sm text-ink-soft">{t.appointments.awaitingMother}</p>}
      <ReminderLine t={t} locale={locale} appointment={item} isAdmin={isAdmin} />
    </>
  );
  if (!chip) return lines;
  return (
    <div className="flex flex-col items-start gap-1.5">
      <StatusChip t={t} status={item.status} />
      {lines}
    </div>
  );
}

/** A today's visit to record (confirmed or moved, today). */
const recordable = (item: StaffAppointment, today: string) =>
  manilaSlot(item.at).date === today && (item.status === "CONFIRMED" || item.status === "RESCHEDULED");

/** Whether the row has a next-step button (Confirm, Record visit or See follow-ups). */
const hasNextStep = (item: StaffAppointment, today: string, now: string) =>
  (item.status === "REQUESTED" && !requestPassed(item, now)) || recordable(item, today) || item.status === "MISSED";

function Actions({
  item,
  slots,
  today,
  now,
  part,
  className,
}: {
  item: StaffAppointment;
  slots: SlotData;
  today: string;
  now: string;
  part?: "all" | "primary" | "menu";
  className?: string;
}) {
  return (
    <AppointmentRowActions
      appointment={{
        id: item.id,
        status: item.status,
        at: item.at,
        hasLogin: item.mother.hasLogin,
        motherName: item.mother.name,
        recordHref: motherAppointmentsHref(item.mother.id),
        followUpsHref: recordFollowUpsHref(item.mother.id),
      }}
      slots={slots}
      recordVisitHref={recordable(item, today) ? `/staff/visits/new?appointment=${item.id}` : undefined}
      datePassed={requestPassed(item, now)}
      part={part}
      className={className}
    />
  );
}
