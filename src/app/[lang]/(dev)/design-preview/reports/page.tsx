import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ReportsView } from "@/features/reports/components/reports-screen";
import { parseReportFilters } from "@/features/reports/period";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { SAMPLE_PUROKS, SAMPLE_SERVICES, SAMPLE_TODAY_DATE, sampleRows, sampleSummary } from "./sample";

export const metadata = { title: "Reports preview", robots: { index: false } };

// Development only (preview): the Reports page with sample figures. Takes the
// page's own filters (?tab=&period=&from=&to=&purok=&service=); ?admin=1 adds
// the SMS tab and card, ?empty=1 shows a period with nothing in it. The
// detail tabs show six sample rows (no real records).
export default function ReportsPreview({ searchParams }: PageProps<"/[lang]/design-preview/reports">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/reports">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const admin = params.admin === "1";
  const filters = parseReportFilters(params, SAMPLE_TODAY_DATE, { isAdmin: admin });
  const empty = params.empty === "1";
  const summary = filters.tab === "summary" ? sampleSummary(filters, { admin, empty }) : null;
  const rows = sampleRows(filters, { admin, empty });

  return (
    <StaffShell
      user={
        admin
          ? { username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }
          : { username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }
      }
    >
      <ReportsView t={t} locale={locale} filters={filters} puroks={SAMPLE_PUROKS} services={SAMPLE_SERVICES} isAdmin={admin} summary={summary} rows={rows} />
    </StaffShell>
  );
}
