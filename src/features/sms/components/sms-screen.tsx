import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { getSendingPanel } from "../queries/sending-panel";
import { countSmsLog, listSmsLog, parseSmsLogFilters } from "../queries/sms-log";
import type { SendingPanel, SmsCounts, SmsLogFilters, SmsLogItem } from "../types";
import { SendCard } from "./send-card";
import { SmsCountTiles } from "./sms-counts";
import { SmsLogFiltersForm } from "./sms-log-filters";
import { SmsLogList } from "./sms-log-list";

// /admin/sms?q=&status=&type=&from=&to=&page=. Reads the session and the
// address: render inside <Suspense>.
export async function SmsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(["ADMIN"]);
  const filters = parseSmsLogFilters(await searchParams);
  const today = manilaTodayISO();
  const [{ t, locale }, panel, counts, { items, total }] = await Promise.all([
    getServerI18n(),
    getSendingPanel(),
    countSmsLog(today),
    listSmsLog(filters),
  ]);
  return <SmsView t={t} locale={locale} panel={panel} counts={counts} items={items} total={total} filters={filters} today={today} />;
}

// The page layout, without data loading (also used by the dev preview).
export function SmsView({
  t,
  locale,
  panel,
  counts,
  items,
  total,
  filters,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  panel: SendingPanel;
  counts: SmsCounts;
  items: SmsLogItem[];
  total: number;
  filters: SmsLogFilters;
  today: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title font-extrabold">{t.sms.title}</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">{t.sms.intro}</p>
      </div>
      <SendCard phoneOnline={panel.phoneOnline} phoneStatusAt={panel.phoneStatusAt} limitReachedAt={panel.limitReachedAt} />
      <SmsCountTiles t={t} counts={counts} filters={filters} today={today} />
      <SmsLogFiltersForm t={t} filters={filters} />
      <SmsLogList t={t} locale={locale} items={items} total={total} filters={filters} canRetry />
    </div>
  );
}
