import { CheckCircleIcon, ClockIcon, CloseIcon, ClosedDayIcon, InfoIcon, type Icon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotDate, slotTile } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import type { AppointmentStatus } from "@/types/database";

// One look for a visit's status wherever the mother sees it (Today and
// Appointments), in the week strip's language: a booked visit is solid green,
// one still waiting is a dashed outline, a new time or a missed visit is rose.

const STATUS: Record<AppointmentStatus, { icon: Icon; tag: string; tile: string }> = {
  CONFIRMED: { icon: CheckCircleIcon, tag: "bg-mint text-leaf", tile: "bg-leaf text-white" },
  REQUESTED: { icon: ClockIcon, tag: "bg-cream text-ink", tile: "border-2 border-dashed border-field bg-white text-ink" },
  RESCHEDULED: { icon: InfoIcon, tag: "bg-blush text-rose-deep", tile: "bg-blush text-rose-deep" },
  COMPLETED: { icon: CheckCircleIcon, tag: "bg-mint text-leaf", tile: "bg-mint text-leaf" },
  MISSED: { icon: ClosedDayIcon, tag: "bg-blush text-rose-deep", tile: "bg-blush text-rose-deep" },
  CANCELLED: { icon: CloseIcon, tag: "bg-cream text-ink-soft", tile: "bg-cream text-ink-soft" },
};

/**
 * The calendar tile: month over day number. "md" (64px wide) stretches to the
 * height of the text beside it; "sm" (48px) is for list rows.
 */
export function VisitDateTile({
  iso,
  locale,
  status,
  size = "md",
  className,
}: {
  iso: string;
  locale: Locale;
  status: AppointmentStatus;
  size?: "md" | "sm";
  className?: string;
}) {
  const tile = slotTile(iso, locale);
  return (
    <p
      className={cn(
        "grid shrink-0 place-content-center text-center",
        size === "md" ? "h-16 w-16 rounded-md" : "h-12 w-12 rounded-sm",
        STATUS[status].tile,
        className,
      )}
    >
      <span className="sr-only">{formatSlotDate(iso, locale)}</span>
      <span aria-hidden className={cn("font-bold tracking-[0.06em] uppercase", size === "md" ? "text-xs leading-4" : "text-[0.6875rem] leading-3")}>
        {tile.month.replace(".", "")}
      </span>
      <span
        aria-hidden
        className={cn("tnum font-extrabold tracking-[-0.02em]", size === "md" ? "text-[1.75rem] leading-8" : "text-xl leading-6")}
      >
        {tile.day}
      </span>
    </p>
  );
}

/** The status tag. "md" is button height (44px), to sit in a row with a button; "sm" for list rows. */
export function VisitStatusTag({ t, status, size = "md", className }: { t: Dictionary; status: AppointmentStatus; size?: "md" | "sm"; className?: string }) {
  const { icon: StatusIcon, tag } = STATUS[status];
  return (
    <p
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap",
        size === "md" ? "h-11 gap-2 px-5 text-[0.95rem]" : "h-8 gap-1.5 px-3 text-sm",
        tag,
        className,
      )}
    >
      <StatusIcon weight="fill" aria-hidden className={cn("shrink-0", size === "md" ? "size-5" : "size-4")} />
      {t.myAppointments.statuses[status]}
    </p>
  );
}

