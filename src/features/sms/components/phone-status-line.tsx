import { PhoneIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";

// "SMS phone online since …" with a dot (leaf online, rose-deep offline, sage
// with no status yet). Used by the dashboard.
export function PhoneStatusLine({
  t,
  locale,
  online,
  at,
  className,
}: {
  t: Dictionary;
  locale: Locale;
  online: boolean | null;
  at: string | null;
  className?: string;
}) {
  return (
    <p className={cn("flex items-center gap-2 text-sm font-medium text-ink-soft", className)}>
      <PhoneIcon aria-hidden className="size-5 shrink-0" />
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", phoneDot(online))} />
      {phoneStatusText(t, locale, online, at)}
    </p>
  );
}

/** "SMS phone online since Sun, Nov 1 · 2:15 PM" (the date and time on one line), or "no status yet". */
export function phoneStatusText(t: Dictionary, locale: Locale, online: boolean | null, at: string | null): string {
  const s = t.sms.send;
  if (online === null || !at) return s.phoneUnknown;
  return format(online ? s.phoneOnline : s.phoneOffline, { time: formatSlot(at, locale, "short").replace(/ /g, " ") });
}

/** The status dot's colour: leaf online, rose-deep offline, sage with no status yet. */
export const phoneDot = (online: boolean | null) => (online === null ? "bg-sage" : online ? "bg-leaf" : "bg-rose-deep");
