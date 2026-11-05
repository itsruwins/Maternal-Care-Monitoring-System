import { Suspense } from "react";
import { notFound } from "next/navigation";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { SmsView } from "@/features/sms/components/sms-screen";
import { parseSmsLogFilters } from "@/features/sms/queries/sms-log";
import { getServerI18n } from "@/i18n/server";
import type { SmsLogFilters, SmsLogItem, SmsLogType } from "@/features/sms/types";
import type { ReminderType } from "@/types/database";
import { SAMPLE_SMS } from "./sample";

const TYPES: Record<SmsLogType, ReminderType[]> = {
  reminder: ["UPCOMING"],
  missed: ["MISSED_NOTICE"],
  answer: ["REQUEST_CONFIRMED", "REQUEST_NEW_TIME", "REQUEST_DECLINED", "VISIT_BOOKED", "VISIT_MOVED", "VISIT_CANCELLED"],
};

/** The Manila date ("YYYY-MM-DD") of a timestamp. */
const manilaDay = (at: string) => new Date(new Date(at).getTime() + 8 * 3_600_000).toISOString().slice(0, 10);

// The same rules as the log's query, on the sample texts.
function matches(item: SmsLogItem, filters: SmsLogFilters, withType: boolean) {
  const status = filters.status;
  const statusOk =
    !status ||
    (status === "waiting" && item.status === "PENDING") ||
    (status === "retrying" && item.retrying) ||
    (status === "sent" && (item.status === "SENT" || item.status === "DELIVERED")) ||
    (status === "delivered" && item.status === "DELIVERED") ||
    (status === "failed" && item.status === "FAILED") ||
    (status === "skipped" && item.status === "SKIPPED");
  const words = filters.q.toLowerCase().split(" ").filter(Boolean);
  const day = manilaDay(item.at);
  return (
    statusOk &&
    (!withType || !filters.type || TYPES[filters.type].includes(item.type)) &&
    words.every((word) => item.mother.name.toLowerCase().includes(word) || item.number.includes(word)) &&
    (!filters.from || day >= filters.from) &&
    (!filters.to || day <= filters.to)
  );
}

export const metadata = { title: "SMS log preview", robots: { index: false } };

// Development only (preview): the SMS log with sample data.
// ?phone=online|offline, ?limit=1, ?empty=1, plus the log's own filters
// (?q=&status=&type=&from=&to=), applied to the sample texts.
export default function SmsPreview({ searchParams }: PageProps<"/[lang]/design-preview/sms">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/sms">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const phone = params.phone === "online" ? true : params.phone === "offline" ? false : null;
  const filters = parseSmsLogFilters(params);
  const all = params.empty === "1" ? [] : SAMPLE_SMS;
  const items = all.filter((item) => matches(item, filters, true));
  const byType = all.filter((item) => matches(item, filters, false));
  const tabs = {
    all: byType.length,
    ...(Object.fromEntries((Object.keys(TYPES) as SmsLogType[]).map((key) => [key, byType.filter((item) => TYPES[key].includes(item.type)).length])) as Record<
      SmsLogType,
      number
    >),
  };
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <SmsView
        t={t}
        locale={locale}
        panel={{
          phoneOnline: phone,
          phoneStatusAt: phone === null ? null : "2026-11-01T06:15:00Z",
          limitReachedAt: params.limit === "1" ? "2026-11-01T02:00:00Z" : null,
        }}
        counts={params.empty === "1" ? { waiting: 0, sentToday: 0, retrying: 0, failed: 0 } : { waiting: 3, sentToday: 3, retrying: 1, failed: 1 }}
        tabs={tabs}
        items={items}
        total={items.length}
        filters={filters}
        today="2026-11-01"
      />
    </StaffShell>
  );
}
