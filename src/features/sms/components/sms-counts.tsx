import Link from "next/link";
import { CaretRightIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { NO_SMS_FILTERS, SMS_LOG_PATH, smsLogHref } from "../paths";
import type { SmsCounts, SmsLogFilters } from "../types";

// Waiting / Sent today / Failed. Each count filters the list (the caret says it
// opens a list); tapping the one in use shows all texts again.
export function SmsCountTiles({ t, counts, filters, today }: { t: Dictionary; counts: SmsCounts; filters: SmsLogFilters; today: string }) {
  const c = t.sms.log.counts;
  const only = (status: SmsLogFilters["status"], day = "") =>
    filters.status === status && !filters.q && !filters.type && filters.from === day && filters.to === day;
  const tiles = [
    { key: "waiting", count: counts.waiting, active: only("waiting"), href: smsLogHref(NO_SMS_FILTERS, { status: "waiting" }), alert: false },
    {
      key: "sentToday",
      count: counts.sentToday,
      active: only("sent", today),
      href: smsLogHref(NO_SMS_FILTERS, { status: "sent", from: today, to: today }),
      alert: false,
    },
    { key: "failed", count: counts.failed, active: only("failed"), href: smsLogHref(NO_SMS_FILTERS, { status: "failed" }), alert: counts.failed > 0 },
  ] as const;

  return (
    <nav aria-label={t.sms.log.countsLabel}>
      <ul className="grid grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <li key={tile.key}>
            <Link
              href={tile.active ? SMS_LOG_PATH : tile.href}
              scroll={false}
              aria-current={tile.active ? "true" : undefined}
              className={cn(
                "flex h-full flex-col gap-0.5 rounded-2xl border-2 bg-white px-4 py-3.5 no-underline shadow-[var(--shadow-soft)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid sm:px-5",
                tile.active ? "border-leaf bg-mint" : "border-transparent hover:border-line",
              )}
            >
              <span className={cn("tnum text-2xl font-extrabold", tile.alert ? "text-rose-deep" : "text-ink")}>{tile.count}</span>
              <span className={cn("flex items-center gap-1 text-sm font-medium", tile.active ? "text-leaf" : "text-ink-soft")}>
                {c[tile.key]}
                <CaretRightIcon weight="bold" aria-hidden className="size-3.5 shrink-0 text-leaf" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
