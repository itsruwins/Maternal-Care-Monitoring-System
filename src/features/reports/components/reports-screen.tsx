import type { ToolbarSelect } from "@/components/shared/filter-toolbar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatPeriod } from "../format";
import { APPOINTMENT_STATUSES, parseReportFilters, PREGNANCY_SHOWS, SERVICE_TABS, SMS_STATUSES, SMS_TYPES } from "../period";
import { reportsHref } from "../paths";
import { getReportRows } from "../queries/details";
import { getPreparer } from "../queries/preparer";
import { getReportSummary, listReportServices } from "../queries/summary";
import type { ReportFilters, ReportRows, ReportService, ReportSummary } from "../types";
import { DetailTab } from "./detail-tab";
import { PrintFooter } from "./print-footer";
import { PrintHeader } from "./print-header";
import { ReportActions } from "./report-actions";
import { ReportFilterBar } from "./report-filter-bar";
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

// The page layout, without data loading (also used by the dev preview): the
// title with the period and purok under it and Print / Download CSV beside
// it, the tabs, the filters, then the tab (Summary, or a detail list). On
// paper only the report, under its printed header and over the signatures.
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
  const f = r.filters;
  const purokName =
    filters.purok === "" ? f.allPuroks : filters.purok === "none" ? f.noPurok : (puroks.find((purok) => purok.id === filters.purok)?.name ?? f.allPuroks);
  const hasFilters =
    filters.period !== "this-month" || filters.purok !== "" || filters.service !== "" || filters.show !== "" || filters.status !== "" || filters.type !== "";

  return (
    <div data-report className="flex flex-col gap-6 print:gap-4">
      <PrintHeader t={t} locale={locale} filters={filters} puroks={puroks} services={services} printedAt={printedAt} />
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 print:hidden">
        <div className="min-w-0">
          <h1 className="text-title font-extrabold tracking-[-0.01em]">{r.title}</h1>
          <p className="mt-1.5 text-ink-soft">
            <span className="tnum font-semibold text-ink">{formatPeriod(filters.from, filters.to, locale)}</span>
            {" · "}
            {purokName}
          </p>
        </div>
        <ReportActions t={t} locale={locale} filters={filters} />
      </header>
      <div className="print:hidden">
        <ReportTabs t={t} filters={filters} isAdmin={isAdmin} />
      </div>

      <ReportFilterBar
        tab={filters.tab === "summary" ? "" : filters.tab}
        period={filters.period}
        from={filters.from}
        to={filters.to}
        selects={reportSelects(t, filters, puroks, services)}
        values={{
          purok: String(filters.purok),
          service: String(filters.service),
          show: filters.show,
          status: filters.status,
          type: filters.type,
        }}
        labels={{ form: f.form, period: f.period, periods: f.periods, from: f.from, to: f.to, clear: f.clear, updating: f.updating }}
        clearHref={hasFilters ? reportsHref(filters, { period: "this-month", purok: "", service: "", show: "", status: "", type: "" }) : null}
      >
        <section aria-labelledby="report-heading">
          <h2 id="report-heading" className="sr-only">
            {r.tabs[filters.tab]}
          </h2>
          {summary && <SummaryTab t={t} locale={locale} filters={filters} summary={summary} />}
          {rows && <DetailTab t={t} locale={locale} filters={filters} rows={rows} />}
        </section>
      </ReportFilterBar>

      <PrintFooter t={t} preparer={preparer} />
    </div>
  );
}

/** The purok, then the tab's own choices: which pregnancies, the service, the status, the kind of text. */
function reportSelects(t: Dictionary, filters: ReportFilters, puroks: PurokOption[], services: ReportService[]): ToolbarSelect[] {
  const f = t.reports.filters;
  const selects: ToolbarSelect[] = [
    {
      name: "purok",
      label: f.purok,
      options: [
        { value: "", label: f.allPuroks },
        ...puroks.map((purok) => ({ value: String(purok.id), label: purok.name })),
        { value: "none", label: f.noPurok },
      ],
    },
  ];
  if (filters.tab === "pregnancies") {
    selects.push({
      name: "show",
      label: f.show,
      options: [{ value: "", label: f.allShows }, ...PREGNANCY_SHOWS.map((value) => ({ value, label: f.shows[value] }))],
    });
  }
  if (SERVICE_TABS.has(filters.tab)) {
    selects.push({
      name: "service",
      label: f.service,
      options: [{ value: "", label: f.allServices }, ...services.map((service) => ({ value: String(service.id), label: service.name }))],
    });
  }
  if (filters.tab === "appointments" || filters.tab === "sms") {
    const statuses =
      filters.tab === "appointments"
        ? APPOINTMENT_STATUSES.map((value) => ({ value, label: t.appointments.statuses[value] }))
        : SMS_STATUSES.map((value) => ({ value, label: t.sms.log.statusFilter[value] }));
    selects.push({ name: "status", label: f.status, options: [{ value: "", label: f.allStatuses }, ...statuses] });
  }
  if (filters.tab === "sms") {
    selects.push({
      name: "type",
      label: f.type,
      options: [{ value: "", label: f.allTypes }, ...SMS_TYPES.map((value) => ({ value, label: t.sms.log.typeFilter[value] }))],
    });
  }
  return selects;
}
