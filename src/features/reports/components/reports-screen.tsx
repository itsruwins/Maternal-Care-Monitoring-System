import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatPeriod } from "../format";
import { parseReportFilters } from "../period";
import { getReportRows } from "../queries/details";
import { getPreparer } from "../queries/preparer";
import { getReportSummary, listReportServices } from "../queries/summary";
import type { ReportFilters, ReportRows, ReportService, ReportSummary } from "../types";
import { DetailTab } from "./detail-tab";
import { PrintFooter } from "./print-footer";
import { PrintHeader } from "./print-header";
import { ReportActions } from "./report-actions";
import { ReportFiltersForm } from "./report-filters";
import { ReportTabs } from "./report-tabs";
import { SummaryTab } from "./summary-tab";

// /staff/reports?tab=&period=&from=&to=&purok=&service=&show=&status=&type=: counts and lists for
// a period. Health workers and admins; the SMS tab and figures are for
// admins only. Reads the session and the address: render inside <Suspense>.
export async function ReportsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const isAdmin = user.role === "ADMIN";
  const today = manilaTodayISO();
  const filters = parseReportFilters(await searchParams, today, { isAdmin });
  const printedAt = new Date().toISOString();
  const [{ t, locale }, puroks, services, preparer] = await Promise.all([getServerI18n(), getShownPuroks(), listReportServices(), getPreparer(user)]);
  const [summary, rows] = await Promise.all([
    filters.tab === "summary" ? getReportSummary(filters, { isAdmin }, services) : Promise.resolve(null),
    getReportRows(filters, { isAdmin }),
  ]);
  return (
    <ReportsView
      t={t}
      locale={locale}
      filters={filters}
      puroks={puroks}
      services={services}
      isAdmin={isAdmin}
      summary={summary}
      rows={rows}
      preparer={preparer}
      printedAt={printedAt}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function ReportsView({
  t,
  locale,
  filters,
  puroks,
  services,
  isAdmin,
  summary,
  rows,
  preparer,
  printedAt,
}: {
  t: Dictionary;
  locale: Locale;
  filters: ReportFilters;
  puroks: PurokOption[];
  services: ReportService[];
  isAdmin: boolean;
  summary: ReportSummary | null;
  rows: ReportRows | null;
  /** The "Prepared by" on paper. */
  preparer: { name: string; position: string | null };
  /** When the page was loaded (the printed date). */
  printedAt: string;
}) {
  const r = t.reports;
  return (
    <div data-report className="flex flex-col gap-6 print:gap-4">
      <PrintHeader t={t} locale={locale} filters={filters} puroks={puroks} services={services} printedAt={printedAt} />
      <div className="print:hidden">
        <h1 className="text-title font-extrabold">{r.title}</h1>
        <p className="mt-2 text-ink-soft">{r.intro}</p>
      </div>
      <div className="flex flex-col gap-6 print:hidden">
        <ReportTabs t={t} filters={filters} isAdmin={isAdmin} />
        <ReportFiltersForm t={t} filters={filters} puroks={puroks} services={services} />
      </div>

      <section aria-labelledby="report-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
          <h2 id="report-heading" className="text-lg font-bold">
            {r.tabs[filters.tab]}
            <span className="block text-[0.95rem] font-medium text-ink-soft">
              {format(r.showing, { period: formatPeriod(filters.from, filters.to, locale) })}
            </span>
          </h2>
          <ReportActions t={t} locale={locale} filters={filters} />
        </div>
        {summary && <SummaryTab t={t} locale={locale} summary={summary} />}
        {rows && <DetailTab t={t} locale={locale} rows={rows} />}
      </section>

      <PrintFooter t={t} preparer={preparer} />
    </div>
  );
}
