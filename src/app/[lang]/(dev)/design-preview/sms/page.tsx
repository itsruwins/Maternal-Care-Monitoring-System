import { Suspense } from "react";
import { notFound } from "next/navigation";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { SmsView } from "@/features/sms/components/sms-screen";
import { parseSmsLogFilters } from "@/features/sms/queries/sms-log";
import { getServerI18n } from "@/i18n/server";
import { SAMPLE_SMS } from "./sample";

export const metadata = { title: "SMS log preview", robots: { index: false } };

// Development only (preview): the SMS log with sample data.
// ?phone=online|offline, ?limit=1, ?empty=1, plus the log's own filters
// (?status=failed etc.; the sample list itself isn't filtered).
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
  const items = params.empty === "1" ? [] : SAMPLE_SMS;
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
        counts={params.empty === "1" ? { waiting: 0, sentToday: 0, failed: 0 } : { waiting: 2, sentToday: 3, failed: 1 }}
        items={items}
        total={items.length}
        filters={parseSmsLogFilters(params)}
        today="2026-11-01"
      />
    </StaffShell>
  );
}
