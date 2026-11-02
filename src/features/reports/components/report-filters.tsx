import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PurokOption } from "@/lib/puroks/types";
import { APPOINTMENT_STATUSES, PREGNANCY_SHOWS, SERVICE_TABS, SMS_STATUSES, SMS_TYPES } from "../period";
import { REPORTS_PATH, reportsHref } from "../paths";
import type { ReportFilters, ReportService } from "../types";
import { PeriodFields } from "./period-fields";

// Period (with From / To for custom dates), purok, then each tab's own
// choices: which pregnancies, the service, the status, the kind of text. A plain GET form: the filters live in the address. Two fields
// per row from 640px, one row from 1280px (The Wide Row Rule), wrapping
// when custom dates and the service leave fields under 192px.
export function ReportFiltersForm({
  t,
  filters,
  puroks,
  services,
}: {
  t: Dictionary;
  filters: ReportFilters;
  puroks: PurokOption[];
  services: ReportService[];
}) {
  const f = t.reports.filters;
  const withService = SERVICE_TABS.has(filters.tab);
  const hasFilters =
    filters.period !== "this-month" || filters.purok !== "" || filters.service !== "" || filters.show !== "" || filters.status !== "" || filters.type !== "";
  const statusOptions =
    filters.tab === "appointments"
      ? APPOINTMENT_STATUSES.map((value) => ({ value, label: t.appointments.statuses[value] }))
      : filters.tab === "sms"
        ? SMS_STATUSES.map((value) => ({ value, label: t.sms.log.statusFilter[value] }))
        : [];

  return (
    <form method="get" action={REPORTS_PATH} className="grid gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 sm:p-5 xl:flex xl:flex-wrap xl:items-end">
      {filters.tab !== "summary" && <input type="hidden" name="tab" value={filters.tab} />}
      <PeriodFields period={filters.period} from={filters.from} to={filters.to} />
      <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
        <Label htmlFor="reports-purok">{f.purok}</Label>
        <NativeSelect id="reports-purok" name="purok" defaultValue={String(filters.purok)}>
          <option value="">{f.allPuroks}</option>
          {puroks.map((purok) => (
            <option key={purok.id} value={String(purok.id)}>
              {purok.name}
            </option>
          ))}
          <option value="none">{f.noPurok}</option>
        </NativeSelect>
      </div>
      {filters.tab === "pregnancies" && (
        <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
          <Label htmlFor="reports-show">{f.show}</Label>
          <NativeSelect id="reports-show" name="show" defaultValue={filters.show}>
            <option value="">{f.allShows}</option>
            {PREGNANCY_SHOWS.map((value) => (
              <option key={value} value={value}>
                {f.shows[value]}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      {withService && (
        <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
          <Label htmlFor="reports-service">{f.service}</Label>
          <NativeSelect id="reports-service" name="service" defaultValue={String(filters.service)}>
            <option value="">{f.allServices}</option>
            {services.map((service) => (
              <option key={service.id} value={String(service.id)}>
                {service.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      {statusOptions.length > 0 && (
        <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
          <Label htmlFor="reports-status">{f.status}</Label>
          <NativeSelect id="reports-status" name="status" defaultValue={filters.status}>
            <option value="">{f.allStatuses}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      {filters.tab === "sms" && (
        <div className="flex flex-col gap-2 xl:min-w-48 xl:flex-1">
          <Label htmlFor="reports-type">{f.type}</Label>
          <NativeSelect id="reports-type" name="type" defaultValue={filters.type}>
            <option value="">{f.allTypes}</option>
            {SMS_TYPES.map((value) => (
              <option key={value} value={value}>
                {t.sms.log.typeFilter[value]}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      <div className="flex gap-2 sm:col-span-2 xl:flex-none">
        <Button type="submit" className="h-12 flex-1 xl:flex-none xl:px-8">
          {f.submit}
        </Button>
        {hasFilters && (
          <Button asChild variant="ghost" className="h-12">
            <a href={reportsHref({ ...filters, period: "this-month", purok: "", service: "", show: "", status: "", type: "" })}>{f.clear}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
