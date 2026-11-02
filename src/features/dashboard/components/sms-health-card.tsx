import { DangerIcon, SmsIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { PhoneStatusLine } from "@/features/sms/components/phone-status-line";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlotDate } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatMonthOf } from "../format";
import { SMS_LINKS } from "../paths";
import type { SmsHealth } from "../types";
import { CountRow } from "./count-row";

// Admin: the SMS phone, this month's texts against the plan limit (a thin
// leaf bar on mint), how they ended, and the waiting and failed texts, which
// open the SMS log.
export function SmsHealthCard({ t, locale, sms, today }: { t: Dictionary; locale: Locale; sms: SmsHealth; today: string }) {
  const s = t.dashboard.admin.sms;
  const share = sms.limit > 0 ? Math.min(sms.sentThisMonth / sms.limit, 1) : 0;
  const atLimit = sms.sentThisMonth >= sms.limit;
  // Only a refusal from this month matters here.
  const limitHit = sms.limitReachedAt !== null && manilaTodayISO(new Date(sms.limitReachedAt)).slice(0, 7) === today.slice(0, 7);

  return (
    <section aria-labelledby="dash-sms" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <IconCircle icon={SmsIcon} tone="mint" size="sm" />
        <h3 id="dash-sms" className="text-lg font-bold">
          {s.title}
        </h3>
      </div>
      <PhoneStatusLine t={t} locale={locale} online={sms.phoneOnline} at={sms.phoneStatusAt} />

      <div className="mt-4 rounded-xl bg-milk p-4">
        <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-medium text-ink">{format(s.sentIn, { month: formatMonthOf(today, locale) })}</span>
          <span className={cn("tnum font-bold", atLimit ? "text-rose-deep" : "text-ink")}>
            {format(s.ofLimit, { count: sms.sentThisMonth, limit: sms.limit })}
          </span>
        </p>
        <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-mint">
          <div className="h-full rounded-full bg-leaf" style={{ width: `${share * 100}%` }} />
        </div>
        <p className="tnum mt-2 text-sm text-ink-soft">
          {format(s.monthLine, { delivered: sms.deliveredThisMonth, failed: sms.failedThisMonth, skipped: sms.skippedThisMonth })}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{format(s.planNote, { limit: sms.limit })}</p>
      </div>

      {limitHit && (
        <p role="status" className="mt-4 flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {format(t.sms.send.limit, { date: formatSlotDate(sms.limitReachedAt!, locale, "short").replace(/ /g, " ") })}
        </p>
      )}

      <ul className="mt-2 divide-y divide-line">
        <CountRow label={s.waiting} count={sms.waiting} href={SMS_LINKS.waiting} />
        <CountRow label={s.failed} count={sms.failed} href={SMS_LINKS.failed} alert />
      </ul>
    </section>
  );
}
