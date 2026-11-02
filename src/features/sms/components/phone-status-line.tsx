import { PhoneIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";

// "SMS phone online since …" with a dot (leaf online, rose-deep offline, sage
// with no status yet). Used by the Automatic sending card and the dashboard.
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
  const s = t.sms.send;
  const line =
    online === null || !at
      ? s.phoneUnknown
      : // The date and time stay on one line.
        format(online ? s.phoneOnline : s.phoneOffline, { time: formatSlot(at, locale, "short").replace(/ /g, " ") });

  return (
    <p className={cn("flex items-center gap-2 text-sm font-medium text-ink-soft", className)}>
      <PhoneIcon aria-hidden className="size-5 shrink-0" />
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", online === null ? "bg-sage" : online ? "bg-leaf" : "bg-rose-deep")} />
      {line}
    </p>
  );
}
