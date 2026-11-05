import { initialsOf } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotClock } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/date-time";
import { daysBetween, formatDate } from "@/lib/utils/pregnancy";
import type { UserRole } from "@/types/database";

// Small pieces shared by the accounts list and one account's page.

/** The initials circle in the role's tint (as its role chip); cream once the account is turned off. */
const TINT: Record<UserRole, string> = {
  ADMIN: "bg-beige text-ink",
  HEALTH_WORKER: "bg-mint text-leaf",
  MOTHER: "bg-blush text-rose-deep",
};

export function AccountInitials({ name, role, off, size = "md" }: { name: string; role: UserRole; off: boolean; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold",
        size === "lg" ? "size-14 text-lg tracking-[0.02em] sm:size-16 sm:text-xl" : "size-10 text-sm",
        off ? "bg-cream text-ink-soft" : TINT[role],
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

/** "Today, 7:14 PM", "Yesterday, 9:02 AM", "3 days ago" (up to a week) or the date. */
export function loginText(t: Dictionary, locale: Locale, at: string, today: string): string {
  const l = t.accounts.login;
  const day = manilaSlot(at).date;
  const days = daysBetween(day, today) ?? 0;
  if (days <= 0) return format(l.today, { time: formatSlotClock(at, locale) });
  if (days === 1) return format(l.yesterday, { time: formatSlotClock(at, locale) });
  if (days < 7) return format(l.daysAgo, { count: days });
  return formatDate(day, locale, "short");
}

/** The last login in words, the exact time on hover; "Never logged in" as a quiet cream chip. */
export function LastLogin({ t, locale, at, today }: { t: Dictionary; locale: Locale; at: string | null; today: string }) {
  if (!at) {
    return (
      <span className="inline-flex h-7 items-center rounded-full bg-cream px-2.5 text-caption font-semibold whitespace-nowrap text-ink-soft">
        {t.accounts.login.never}
      </span>
    );
  }
  return (
    <time dateTime={at} title={formatDateTime(at, locale)} className="tnum text-ink">
      {loginText(t, locale, at, today)}
    </time>
  );
}
