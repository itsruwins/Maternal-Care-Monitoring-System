import { CheckCircleIcon, ClockIcon, DangerIcon, RetryIcon } from "@/components/icons";
import { CountCards } from "@/components/shared/count-cards";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { PillTabs } from "@/components/shared/pill-tabs";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { NO_SMS_FILTERS, smsLogQuery } from "../paths";
import { getSendingPanel } from "../queries/sending-panel";
import { countSmsLog, countSmsTypes, listSmsLog, parseSmsLogFilters } from "../queries/sms-log";
import type { SendingPanel, SmsCounts, SmsLogFilters, SmsLogItem, SmsLogStatus, SmsLogType, SmsTypeCounts } from "../types";
import { SendCard } from "./send-card";
import { SmsLogList } from "./sms-log-list";

const TYPE_TABS = ["", "reminder", "missed", "answer"] as const satisfies readonly (SmsLogType | "")[];
const STATUSES: SmsLogStatus[] = ["waiting", "retrying", "sent", "delivered", "failed", "skipped"];

// /admin/sms?q=&status=&type=&from=&to=&page=. Reads the session and the
// address: render inside <Suspense>.
export async function SmsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(["ADMIN"]);
  const filters = parseSmsLogFilters(await searchParams);
  const today = manilaTodayISO();
  const [{ t, locale }, panel, counts, tabs, { items, total }] = await Promise.all([
    getServerI18n(),
    getSendingPanel(),
    countSmsLog(today),
    countSmsTypes(filters),
    listSmsLog(filters),
  ]);
  return <SmsView t={t} locale={locale} panel={panel} counts={counts} tabs={tabs} items={items} total={total} filters={filters} today={today} />;
}

// The page layout, without data loading (also used by the dev preview): the
// title, the sending bar, four counts (each opening its list; Failed
// rose-deep only when there are some), the type tabs with their counts, then
// the texts in their filter card (search, status and dates, applied at once).
export function SmsView({
  t,
  locale,
  panel,
  counts,
  tabs,
  items,
  total,
  filters,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  panel: SendingPanel;
  counts: SmsCounts;
  tabs: SmsTypeCounts;
  items: SmsLogItem[];
  total: number;
  filters: SmsLogFilters;
  today: string;
}) {
  const l = t.sms.log;
  const s = l.search;
  const c = l.counts;
  const hasFilters = Boolean(filters.q || filters.status || filters.from || filters.to);
  const only = (changes: Partial<SmsLogFilters>) => smsLogQuery(NO_SMS_FILTERS, changes);

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0">
        <h1 className="text-title font-extrabold tracking-[-0.01em]">{t.sms.title}</h1>
        <p className="mt-2 max-w-[64ch] text-ink-soft">{t.sms.intro}</p>
      </div>

      <SendCard phoneOnline={panel.phoneOnline} phoneStatusAt={panel.phoneStatusAt} limitReachedAt={panel.limitReachedAt} />

      <CountCards
        label={l.countsLabel}
        cards={[
          { key: "waiting", label: c.waiting, count: counts.waiting, href: only({ status: "waiting" }), icon: ClockIcon },
          { key: "sentToday", label: c.sentToday, count: counts.sentToday, href: only({ status: "sent", from: today, to: today }), icon: CheckCircleIcon },
          { key: "retrying", label: c.retrying, count: counts.retrying, href: only({ status: "retrying" }), icon: RetryIcon },
          { key: "failed", label: c.failed, count: counts.failed, href: only({ status: "failed" }), icon: DangerIcon, alert: counts.failed > 0 },
        ]}
      />

      <div className="flex flex-col gap-4">
        <PillTabs
          label={l.tabs.label}
          tabs={TYPE_TABS.map((type) => ({
            key: type || "all",
            label: type ? l.typeFilter[type] : l.tabs.all,
            count: tabs[type || "all"],
            href: smsLogQuery(filters, { type }),
            active: filters.type === type,
          }))}
        />
        <FilterToolbar
          id="sms"
          values={{ q: filters.q, status: filters.status, from: filters.from, to: filters.to }}
          hidden={filters.type ? { type: filters.type } : {}}
          selects={[
            {
              name: "status",
              label: s.status,
              options: [{ value: "", label: s.anyStatus }, ...STATUSES.map((status) => ({ value: status, label: l.statusFilter[status] }))],
            },
          ]}
          labels={{ form: s.form, search: s.label, placeholder: s.placeholder, from: s.from, to: s.to, clear: s.clear, updating: s.updating }}
          clearHref={hasFilters ? smsLogQuery(filters, { q: "", status: "", from: "", to: "" }) : null}
        >
          <SmsLogList t={t} locale={locale} items={items} total={total} filters={filters} canRetry />
        </FilterToolbar>
      </div>
    </div>
  );
}
