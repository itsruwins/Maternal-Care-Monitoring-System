import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot, formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { formatDateTime } from "@/lib/utils/date-time";
import type { SlotData, StaffAppointment } from "../types";
import { AppointmentActions } from "./appointment-actions";
import { DatePassedLine, FollowUpsLink, ReminderLine, StatusChip, requestPassed } from "./appointment-bits";

// One appointment for staff: when, who (links to her record), the service,
// status, notes, reminder, and the actions while it's open (Missed ones link
// to her follow-ups).
export function AppointmentCard({
  t,
  locale,
  appointment,
  slots,
  showMother = true,
  showDate = true,
  today,
  now,
  isAdmin = false,
}: {
  t: Dictionary;
  locale: Locale;
  appointment: StaffAppointment;
  slots: SlotData;
  showMother?: boolean;
  showDate?: boolean;
  /** Manila date; today's confirmed visits get "Record visit". */
  today?: string;
  /** The current instant (ISO); requests past their time say "Date passed". */
  now?: string;
  /** Admins: a failed reminder links to the SMS log. */
  isAdmin?: boolean;
}) {
  const a = t.appointments;
  const isRequest = appointment.status === "REQUESTED";
  const passed = now !== undefined && requestPassed(appointment, now);
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="tnum text-[0.95rem] text-ink-soft">
            {showDate && <>{formatSlotDate(appointment.at, locale)} · </>}
            <span className="font-semibold text-ink">{formatSlotClock(appointment.at, locale)}</span>
          </p>
          {showMother && (
            <Link href={`/staff/mothers/${appointment.mother.id}?tab=appointments`} className="mt-0.5 block font-semibold break-words text-ink no-underline hover:text-leaf hover:underline">
              {appointment.mother.name}
            </Link>
          )}
          <p className="break-words">{appointment.service}</p>
        </div>
        <StatusChip t={t} status={appointment.status} />
      </div>

      {passed && <DatePassedLine t={t} />}
      {isRequest && <p className="text-sm text-ink-soft">{format(a.waitingSince, { date: formatDateTime(appointment.createdAt, locale) })}</p>}
      {appointment.status === "RESCHEDULED" && (
        <p className="text-sm text-ink-soft">
          {a.awaitingMother} {a.asked}: {formatSlot(appointment.requestedAt, locale, "short")}
        </p>
      )}
      {appointment.remarks && (
        <p className="text-sm break-words whitespace-pre-line text-ink-soft">
          <span className="font-medium text-ink">{a.remarks}:</span> {appointment.remarks}
        </p>
      )}
      <ReminderLine t={t} locale={locale} appointment={appointment} isAdmin={isAdmin} />
      {appointment.status === "MISSED" && (
        <div className="flex">
          <FollowUpsLink t={t} mother={appointment.mother} />
        </div>
      )}
      <AppointmentActions
        appointment={{ id: appointment.id, status: appointment.status, at: appointment.at, hasLogin: appointment.mother.hasLogin }}
        slots={slots}
        recordHref={
          today && ["CONFIRMED", "RESCHEDULED"].includes(appointment.status) && manilaSlot(appointment.at).date === today
            ? `/staff/visits/new?appointment=${appointment.id}`
            : undefined
        }
        datePassed={passed}
      />
    </article>
  );
}
