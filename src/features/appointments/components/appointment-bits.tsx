import { ReminderIcon } from "@/components/icons";
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

/** "Reminder queued for Wed, Nov 4 · 8:00 AM" (confirmed visits only). */
export function ReminderLine({ t, locale, appointment }: { t: Dictionary; locale: Locale; appointment: StaffAppointment }) {
  const r = t.appointments.reminder;
  const reminder = appointment.reminder;
  if (appointment.status !== "CONFIRMED" && !reminder) return null;
  const text = !reminder
    ? r.none
    : reminder.status === "PENDING"
      ? format(r.PENDING, { when: formatSlot(reminder.at, locale, "short") })
      : reminder.status === "FAILED"
        ? r.FAILED
        : format(r[reminder.status], { when: formatSlot(reminder.sentAt ?? reminder.at, locale, "short") });
  return (
    <p className={cn("flex items-center gap-1.5 text-sm", reminder?.status === "FAILED" ? "text-rose-deep" : "text-ink-soft")}>
      <ReminderIcon aria-hidden className="size-4 shrink-0" />
      {text}
    </p>
  );
}
