import Link from "next/link";
import { CallIcon, ClockIcon, ReminderIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { recordFollowUpsHref } from "@/features/follow-ups/paths";
import { NO_SMS_FILTERS, smsLogHref } from "@/features/sms/paths";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import type { AppointmentStatus } from "@/types/database";
import type { StaffAppointment } from "../types";

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  REQUESTED: "border border-dashed border-leaf text-leaf",
  CONFIRMED: "bg-mint text-leaf",
  RESCHEDULED: "bg-blush text-rose-deep",
  COMPLETED: "bg-mint text-leaf",
  MISSED: "bg-blush text-rose-deep",
  CANCELLED: "bg-cream text-ink-soft",
};

export function StatusChip({ t, status }: { t: Dictionary; status: AppointmentStatus }) {
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap", STATUS_STYLE[status])}>
      {t.appointments.statuses[status]}
    </span>
  );
}

/** "Reminder queued for Wed, Nov 4 · 8:00 AM", "…trying again …", "No reminder needed: …" (confirmed visits only). */
/** isAdmin: a failed reminder links to it in the SMS log (admins only). */
export function ReminderLine({ t, locale, appointment, isAdmin = false }: { t: Dictionary; locale: Locale; appointment: StaffAppointment; isAdmin?: boolean }) {
  const r = t.appointments.reminder;
  const reminder = appointment.reminder;
  if (appointment.status !== "CONFIRMED" && !reminder) return null;
  const retrying = reminder?.status === "PENDING" && reminder.retryAt !== null;
  // Date and time kept together, so a long line breaks after the label.
  const slot = (at: string) => formatSlot(at, locale, "short").replace(/ /g, "\u00a0");
  const text = !reminder
    ? r.none
    : retrying
      ? format(r.retrying, { when: slot(reminder.retryAt!) })
      : reminder.status === "PENDING"
        ? format(r.PENDING, { when: slot(reminder.at) })
        : reminder.status === "FAILED"
          ? r.FAILED
          : reminder.status === "SKIPPED"
            ? reminder.reason === "covered_by_answer"
              ? r.covered
              : r.SKIPPED
            : format(r[reminder.status], { when: slot(reminder.sentAt ?? reminder.at) });
  const failed = reminder?.status === "FAILED";
  return (
    <p className={cn("flex items-start gap-1.5 text-sm", failed || retrying ? "text-rose-deep" : "text-ink-soft")}>
      <ReminderIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        {text}
        {failed && isAdmin && (
          <span className="block">
            <Link href={smsLogHref(NO_SMS_FILTERS, { status: "failed", q: appointment.mother.contactNumber })} className="inline-flex min-h-11 items-center font-semibold whitespace-nowrap text-leaf underline decoration-1 underline-offset-4 hover:decoration-2">
              {r.seeInLog}
            </Link>
          </span>
        )}
      </span>
    </p>
  );
}

/** A request whose time came before staff answered it: it can only be moved or cancelled. */
export function requestPassed(appointment: { status: AppointmentStatus; at: string }, now: string): boolean {
  return appointment.status === "REQUESTED" && Date.parse(appointment.at) <= Date.parse(now);
}

export function DatePassedLine({ t }: { t: Dictionary }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-deep">
      <ClockIcon weight="bold" aria-hidden className="size-4 shrink-0" />
      {t.appointments.datePassed}
    </p>
  );
}

/** Missed: "See follow-ups" on her record. */
export function FollowUpsLink({ t, mother }: { t: Dictionary; mother: { id: number; name: string } }) {
  const a = t.appointments;
  return (
    <Button asChild size="sm" variant="secondary">
      <Link href={recordFollowUpsHref(mother.id)} aria-label={format(a.followUpsFor, { name: mother.name })}>
        <CallIcon weight="bold" aria-hidden />
        {a.followUps}
      </Link>
    </Button>
  );
}
