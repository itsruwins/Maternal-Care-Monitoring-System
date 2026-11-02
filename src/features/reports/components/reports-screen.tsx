import { ReportsIcon } from "@/components/icons";
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
import { getReportSummary, listReportServices } from "../queries/summary";
import type { ReportFilters, ReportService, ReportSummary } from "../types";
import { ReportFiltersForm } from "./report-filters";
import { ReportTabs } from "./report-tabs";
import { SummaryTab } from "./summary-tab";

// /staff/reports?tab=&period=&from=&to=&purok=&service=: counts and lists for
// a period. Health workers and admins; the SMS tab and figures are for
// admins only. Reads the session and the address: render inside <Suspense>.
export async function ReportsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const isAdmin = user.role === "ADMIN";
  const today = manilaTodayISO();
  const filters = parseReportFilters(await searchParams, today, { isAdmin });
  const [{ t, locale }, puroks, services] = await Promise.all([getServerI18n(), getShownPuroks(), listReportServices()]);
  const summary = filters.tab === "summary" ? await getReportSummary(filters, { isAdmin }, services) : null;
  return <ReportsView t={t} locale={locale} filters={filters} puroks={puroks} services={services} isAdmin={isAdmin} summary={summary} />;
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
}: {
  t: Dictionary;
  locale: Locale;
  filters: ReportFilters;
  puroks: PurokOption[];
  services: ReportService[];
  isAdmin: boolean;
  summary: ReportSummary | null;
}) {
  const r = t.reports;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title font-extrabold">{r.title}</h1>
        <p className="mt-2 text-ink-soft">{r.intro}</p>
      </div>
      <ReportTabs t={t} filters={filters} isAdmin={isAdmin} />
      <ReportFiltersForm t={t} filters={filters} puroks={puroks} services={services} />

      <section aria-labelledby="report-heading" className="flex flex-col gap-4">
        <h2 id="report-heading" className="text-lg font-bold">
          {r.tabs[filters.tab]}
          <span className="block text-[0.95rem] font-medium text-ink-soft">
            {format(r.showing, { period: formatPeriod(filters.from, filters.to, locale) })}
          </span>
        </h2>
        {summary ? (
          <SummaryTab t={t} locale={locale} summary={summary} />
        ) : (
          <div className="flex items-center gap-3 rounded-3xl bg-white p-5 text-ink-soft shadow-[var(--shadow-soft)] sm:p-6">
            <ReportsIcon weight="fill" aria-hidden className="size-6 shrink-0 text-leaf" />
            <p>{r.comingSoon}</p>
          </div>
        )}
      </section>
    </div>
  );
}
