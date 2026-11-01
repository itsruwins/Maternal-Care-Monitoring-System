import { CaretDownIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import type { SmsLogItem } from "../types";

// Small pieces shared by the SMS log and her record's SMS log tab (no hooks,
// so server and client components can both use them).

type Shown = "PENDING" | "retrying" | "SENT" | "DELIVERED" | "FAILED" | "SKIPPED";

const CHIP_STYLE: Record<Shown, string> = {
  PENDING: "border border-dashed border-leaf text-leaf",
  retrying: "border border-dashed border-rose-deep text-rose-deep",
  SENT: "border border-leaf text-leaf",
  DELIVERED: "bg-mint text-leaf",
  FAILED: "bg-blush text-rose-deep",
  SKIPPED: "bg-cream text-ink-soft",
};

const shownOf = (item: SmsLogItem): Shown => (item.retrying ? "retrying" : item.status);

/** "Sun, Nov 1 · 2:20 PM" that never breaks across lines. */
const slot = (at: string, locale: Locale) => formatSlot(at, locale, "short").replace(/ /g, "\u00a0");

export function SmsStatusChip({ t, item }: { t: Dictionary; item: SmsLogItem }) {
  const shown = shownOf(item);
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap", CHIP_STYLE[shown])}>
      {t.sms.log.statuses[shown]}
    </span>
  );
}

/** Under the chip: when it goes or went out, and why it is retried, failed or not sent. */
export function SmsStatusDetail({ t, locale, item }: { t: Dictionary; locale: Locale; item: SmsLogItem }) {
  const l = t.sms.log;
  const shown = shownOf(item);
  const when = slot(item.at, locale);
  const reason = item.reason ? l.reasons[item.reason as keyof typeof l.reasons] : undefined;
  const lines =
    shown === "PENDING"
      ? [format(l.when.PENDING, { when })]
      : shown === "retrying"
        ? [format(l.when.retrying, { when }), reason]
        : shown === "SENT" || shown === "DELIVERED"
          ? [format(l.when.SENT, { when })]
          : [reason];
  return (
    <>
      {lines.filter(Boolean).map((line, index) => (
        <p key={index} className={cn("text-sm", shown === "FAILED" || (shown === "retrying" && index > 0) ? "text-rose-deep" : "text-ink-soft")}>
          {line}
        </p>
      ))}
    </>
  );
}

/** "Prenatal Checkup · Thu, Nov 5 · 9:00 AM": what the text is about. */
export function smsAbout(t: Dictionary, locale: Locale, item: SmsLogItem): string {
  return format(t.sms.log.about, { service: item.service, when: slot(item.visitAt, locale) });
}

/** "Show text": the full message, folded (plain <details>, works without JavaScript). */
export function SmsText({ t, text }: { t: Dictionary; text: string }) {
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid [&::-webkit-details-marker]:hidden">
        {t.sms.log.showText}
        <CaretDownIcon weight="bold" aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 rounded-xl bg-cream px-3.5 py-2.5 text-sm leading-6 break-words whitespace-pre-wrap">{text}</p>
    </details>
  );
}
