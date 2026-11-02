import { ActivityTypesIcon, AppointmentIcon, CheckupIcon, PregnancyIcon, SmsIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import type { AppointmentStatus, PregnancyOutcome } from "@/types/database";
import type { ReportSummary } from "../types";
import { FigureList } from "./figure-list";
import { ReportCard } from "./report-card";
import { ServicesBars } from "./services-bars";
import { VisitsChart } from "./visits-chart";

const OUTCOMES: PregnancyOutcome[] = ["LIVE_BIRTH", "STILLBIRTH", "MISCARRIAGE", "OTHER"];
const STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];

// The Summary tab: four totals, then a card each for pregnancies, visits,
// appointments and services (and texts, for admins). Cards sit two across
// from 1280px.
export function SummaryTab({ t, locale, summary }: { t: Dictionary; locale: Locale; summary: ReportSummary }) {
  const s = t.reports.summary;
  const servicesTotal = summary.services.reduce((sum, service) => sum + service.count, 0);
  const closed = OUTCOMES.reduce((sum, outcome) => sum + summary.pregnancies.closed[outcome], 0);
  const tiles = [
    { key: "pregnant", value: summary.pregnancies.active, alert: false },
    { key: "visits", value: summary.visits.completed, alert: false },
    { key: "missed", value: summary.appointments.MISSED, alert: true },
    { key: "services", value: servicesTotal, alert: false },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={s.tilesLabel}>
        <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4 print:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.key} className="flex flex-col-reverse justify-end gap-0.5 rounded-2xl bg-white px-4 py-3.5 shadow-[var(--shadow-soft)] sm:px-5 print:rounded-none print:border print:border-line">
              <dt className="text-sm font-medium text-ink-soft">{s.tiles[tile.key]}</dt>
              <dd className={cn("tnum text-2xl font-extrabold", tile.alert && tile.value > 0 ? "text-rose-deep" : "text-ink")}>{tile.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <ReportCard id="report-pregnancies" icon={PregnancyIcon} title={s.pregnancies.title}>
          <FigureList
            figures={[
              { label: s.pregnancies.active, value: summary.pregnancies.active },
              { label: s.pregnancies.added, value: summary.pregnancies.added },
              { label: s.pregnancies.closed, value: closed },
              ...OUTCOMES.map((outcome) => ({ label: t.mothers.outcomes[outcome], value: summary.pregnancies.closed[outcome], sub: true })),
            ]}
          />
        </ReportCard>

        <ReportCard id="report-visits" icon={CheckupIcon} title={s.visits.title}>
          <FigureList
            figures={[
              { label: s.visits.completed, value: summary.visits.completed },
              { label: s.visits.mothers, value: summary.visits.mothers },
              { label: s.visits.walkIns, value: summary.visits.walkIns },
            ]}
          />
          <VisitsChart t={t} locale={locale} grouping={summary.visits.grouping} buckets={summary.visits.buckets} />
        </ReportCard>

        <ReportCard id="report-appointments" icon={AppointmentIcon} title={s.appointments.title} note={s.appointments.note}>
          <FigureList
            figures={STATUSES.map((status) => ({
              label: t.appointments.statuses[status],
              value: summary.appointments[status],
              alert: status === "MISSED",
            }))}
          />
        </ReportCard>

        <ReportCard id="report-services" icon={ActivityTypesIcon} title={s.services.title} note={s.services.note}>
          {servicesTotal === 0 ? (
            <p className="py-2 text-[0.95rem] text-ink-soft">{s.services.none}</p>
          ) : (
            <ServicesBars services={summary.services} />
          )}
        </ReportCard>

        {summary.sms && (
          <ReportCard id="report-sms" icon={SmsIcon} title={s.sms.title} note={s.sms.note} className="xl:col-span-2">
            <FigureList
              className="xl:grid xl:grid-cols-5 xl:gap-x-6 xl:divide-y-0"
              figures={[
                { label: s.sms.sent, value: summary.sms.sent },
                { label: s.sms.delivered, value: summary.sms.delivered },
                { label: s.sms.failed, value: summary.sms.failed, alert: true },
                { label: s.sms.notSent, value: summary.sms.notSent },
                { label: s.sms.waiting, value: summary.sms.waiting },
              ]}
            />
          </ReportCard>
        )}
      </div>
    </div>
  );
}
