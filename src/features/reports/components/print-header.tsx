import Image from "next/image";
import { isPlaceholder, SITE } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PurokOption } from "@/lib/puroks/types";
import { formatPeriod, formatReportClock, formatReportDay } from "../format";
import { SERVICE_TABS } from "../period";
import type { ReportFilters, ReportService } from "../types";

// Paper only: the seal, the health center (its contact number once a real one
// is set), the report's title, period and filters, and when it was printed.
export function PrintHeader({
  t,
  locale,
  filters,
  puroks,
  services,
  printedAt,
}: {
  t: Dictionary;
  locale: Locale;
  filters: ReportFilters;
  puroks: PurokOption[];
  services: ReportService[];
  printedAt: string;
}) {
  const p = t.reports.print;
  const contact = SITE.healthCenter.contactNumber;
  const chosen = filterList(t, filters, puroks, services);
  return (
    <header className="hidden border-b border-ink pb-3 print:block">
      <div className="flex items-center gap-3">
        <Image src="/brand/seal-192.png" alt="" width={56} height={56} loading="eager" className="size-14 shrink-0" />
        <div className="text-sm leading-5">
          <p className="text-base font-bold">{p.center}</p>
          <p>{SITE.healthCenter.address}</p>
          {!isPlaceholder(contact) && <p>{format(p.contact, { number: contact })}</p>}
        </div>
      </div>
      <h2 className="mt-3 text-xl font-bold">{format(p.title, { tab: t.reports.tabs[filters.tab] })}</h2>
      <p className="text-sm">{format(p.period, { period: formatPeriod(filters.from, filters.to, locale) })}</p>
      <p className="text-sm">{format(p.filters, { list: chosen.join(" · ") })}</p>
      <p className="text-sm">{format(p.printed, { when: `${formatReportDay(printedAt, locale)}, ${formatReportClock(printedAt, locale)}` })}</p>
    </header>
  );
}

/** "Purok: Purok 3 · Service: Tetanus vaccine · Status: Missed": the purok always, the rest when chosen. */
function filterList(t: Dictionary, filters: ReportFilters, puroks: PurokOption[], services: ReportService[]): string[] {
  const f = t.reports.filters;
  const purok =
    filters.purok === "" ? f.allPuroks : filters.purok === "none" ? f.noPurok : (puroks.find((p) => p.id === filters.purok)?.name ?? f.allPuroks);
  const list = [`${f.purok}: ${purok}`];
  if (SERVICE_TABS.has(filters.tab)) {
    list.push(`${f.service}: ${filters.service === "" ? f.allServices : (services.find((s) => s.id === filters.service)?.name ?? f.allServices)}`);
  }
  if (filters.show) list.push(`${f.show}: ${f.shows[filters.show]}`);
  if (filters.status) {
    const label =
      filters.tab === "sms"
        ? t.sms.log.statusFilter[filters.status as keyof typeof t.sms.log.statusFilter]
        : t.appointments.statuses[filters.status as keyof typeof t.appointments.statuses];
    list.push(`${f.status}: ${label}`);
  }
  if (filters.type) list.push(`${f.type}: ${t.sms.log.typeFilter[filters.type]}`);
  return list;
}
