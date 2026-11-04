import Link from "next/link";
import { ClockIcon } from "@/components/icons";
import { Ticket, TicketPill } from "@/components/shared/ticket";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock, formatSlotWeekday, slotTile } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { daysBetween } from "@/lib/utils/pregnancy";
import { motherAppointmentsHref } from "../paths";
import type { SlotData, StaffAppointment } from "../types";
import { AppointmentActions } from "./appointment-actions";
import { DatePassedLine, StatusChip, requestPassed } from "./appointment-bits";

// One waiting request as a booking ticket (the shared Ticket): the stub holds
// the weekday, the day in large numerals, the month, and the time on a white
// pill (blush with rose-deep once the date has passed); the body: her initials, name and number,
// the service with the Requested chip, the date-passed flag, how long ago
// she asked and her note. A milk band closes it with Confirm, Other time and
// Cancel.
export function RequestCard({
  t,
  locale,
  appointment,
  slots,
  today,
  now,
}: {
  t: Dictionary;
  locale: Locale;
  appointment: StaffAppointment;
  slots: SlotData;
  /** Manila date, for how long ago she asked. */
  today: string;
  now: string;
}) {
  const a = t.appointments;
  const q = a.queue;
  const passed = requestPassed(appointment, now);
  const tile = slotTile(appointment.at, locale);
  const ago = daysBetween(manilaSlot(appointment.createdAt).date, today) ?? 0;
  const asked = ago <= 0 ? q.askedToday : ago === 1 ? q.askedYesterday : format(q.askedDaysAgo, { days: ago });

  return (
    <Ticket
      tone={passed ? "blush" : "mint"}
      stub={
        <>
          <span className="text-sm font-semibold">{formatSlotWeekday(appointment.at, locale)}</span>
          <span className="tnum mt-1 text-[2.5rem] leading-none font-extrabold tracking-[-0.03em] sm:text-5xl">{tile.day}</span>
          <span className="mt-1 text-sm font-semibold">{tile.month}</span>
          <TicketPill>{formatSlotClock(appointment.at, locale)}</TicketPill>
        </>
      }
      footer={
        <AppointmentActions
          appointment={{ id: appointment.id, status: appointment.status, at: appointment.at, hasLogin: appointment.mother.hasLogin }}
          slots={slots}
          datePassed={passed}
          // Phones: Confirm takes the first row, Other time and Cancel share the second.
          className="max-sm:grid max-sm:grid-cols-2 max-sm:[&>*]:w-full max-sm:[&>*:first-child:nth-last-child(3)]:col-span-2"
        />
      }
    >
      <span className="flex min-w-0 items-center gap-3">
        <MotherInitials name={appointment.mother.name} />
        <span className="flex min-w-0 flex-col">
          <Link
            href={motherAppointmentsHref(appointment.mother.id)}
            className="self-start font-bold break-words text-ink no-underline hover:text-leaf hover:underline"
          >
            {appointment.mother.name}
          </Link>
          <span className="tnum text-sm text-ink-soft">{appointment.mother.contactNumber}</span>
        </span>
      </span>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <p className="min-w-0 font-semibold break-words text-ink">{appointment.service}</p>
          <StatusChip t={t} status={appointment.status} />
        </div>
        {passed && <DatePassedLine t={t} />}
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <ClockIcon aria-hidden className="size-4 shrink-0" />
          {asked}
        </p>
        {appointment.remarks && (
          <p className="text-sm break-words whitespace-pre-line text-ink-soft">
            <span className="font-medium text-ink">{a.noteLabel}:</span> {appointment.remarks}
          </p>
        )}
      </div>
    </Ticket>
  );
}
