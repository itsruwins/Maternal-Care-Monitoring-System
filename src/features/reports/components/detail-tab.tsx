import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ReportFilters, ReportRows } from "../types";
import { AppointmentsDetail } from "./appointments-detail";
import { PregnanciesDetail } from "./pregnancies-detail";
import { ServicesDetail } from "./services-detail";
import { SmsDetail } from "./sms-detail";
import { VisitsDetail } from "./visits-detail";

// The list for the chosen detail tab.
export function DetailTab({ t, locale, filters, rows }: { t: Dictionary; locale: Locale; filters: ReportFilters; rows: ReportRows }) {
  switch (rows.tab) {
    case "pregnancies":
      return <PregnanciesDetail t={t} locale={locale} rows={rows.rows} />;
    case "visits":
      return <VisitsDetail t={t} locale={locale} filters={filters} rows={rows.rows} />;
    case "appointments":
      return <AppointmentsDetail t={t} locale={locale} filters={filters} rows={rows.rows} />;
    case "services":
      return <ServicesDetail t={t} locale={locale} filters={filters} rows={rows.rows} />;
    case "sms":
      return <SmsDetail t={t} locale={locale} filters={filters} rows={rows.rows} />;
  }
}
