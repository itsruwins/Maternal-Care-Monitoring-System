import { ActivityTypesIcon, AppointmentIcon, CheckupIcon, PregnancyIcon, SmsIcon } from "@/components/icons";
import { CountCards } from "@/components/shared/count-cards";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { AppointmentStatus, PregnancyOutcome } from "@/types/database";
import { reportsHref } from "../paths";
import type { ReportFilters, ReportSummary, ReportTab } from "../types";
import { FigureList } from "./figure-list";
import { ReportCard } from "./report-card";
import { VisitsChart } from "./visits-chart";

const OUTCOMES: PregnancyOutcome[] = ["LIVE_BIRTH", "STILLBIRTH", "MISCARRIAGE", "OTHER"];
const STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];

// The Summary tab: four totals (each opening its list; missed appointments
// rose-deep only when there are some), then a card each for pregnancies,
// appointments, visits and services (and texts, for admins): from 1280px
// Pregnancies and Appointments side by side at one height, the rest across
// the full width. Each card leads with its total and shows each row's share of it
// (one scale per card, sub-rows included, so longer always means more).
export function SummaryTab({ t, locale, filters, summary }: { t: Dictionary; locale: Locale; filters: ReportFilters; summary: ReportSummary }) {
  const s = t.reports.summary;
  const servicesTotal = summary.services.reduce((sum, service) => sum + service.count, 0);
  const closed = OUTCOMES.reduce((sum, outcome) => sum + summary.pregnancies.closed[outcome], 0);
  const appointmentsTotal = STATUSES.reduce((sum, status) => sum + summary.appointments[status], 0);
  const sms = summary.sms;
  const smsTotal = sms ? sms.sent + sms.failed + sms.notSent + sms.waiting : 0;
  // A detail tab for the same period and purok.
  const list = (tab: ReportTab, changes: Partial<ReportFilters> = {}) =>
    reportsHref(filters, { tab, service: "", show: "", status: "", type: "", ...changes });
  const more = (tab: ReportTab) => ({ href: list(tab), label: s.viewList });

  return (
    <div className="flex flex-col gap-6">
      <CountCards
        label={s.tilesLabel}
        cards={[
          { key: "pregnant", label: s.tiles.pregnant, count: summary.pregnancies.active, href: list("pregnancies"), icon: PregnancyIcon },
          { key: "visits", label: s.tiles.visits, count: summary.visits.completed, href: list("visits"), icon: CheckupIcon },
          {
            key: "missed",
            label: s.tiles.missed,
            count: summary.appointments.MISSED,
            href: list("appointments", { status: "MISSED" }),
            icon: AppointmentIcon,
            alert: summary.appointments.MISSED > 0,
          },
          { key: "services", label: s.tiles.services, count: servicesTotal, href: list("services"), icon: ActivityTypesIcon },
        ]}
      />

      {/* Rows that line up: Pregnancies beside Appointments (same height, the
          "View the list" footers level), then Visits, Services and texts each
          across the full width, so no card is left with a hole beside it. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 print:block print:space-y-6">
        <ReportCard
          id="report-pregnancies"
          icon={PregnancyIcon}
          title={s.pregnancies.title}
          note={s.pregnancies.note}
          total={{ value: summary.pregnancies.active, label: s.totals.pregnancies }}
          more={more("pregnancies")}
        >
          <FigureList
            figures={[
              { label: s.pregnancies.added, value: summary.pregnancies.added, of: summary.pregnancies.active },
              { label: s.pregnancies.closed, value: closed, of: summary.pregnancies.active },
              ...OUTCOMES.map((outcome) => ({ label: t.mothers.outcomes[outcome], value: summary.pregnancies.closed[outcome], sub: true, of: summary.pregnancies.active })),
            ]}
          />
        </ReportCard>

        <ReportCard
          id="report-appointments"
          icon={AppointmentIcon}
          title={s.appointments.title}
          note={s.appointments.note}
          total={{ value: appointmentsTotal, label: s.totals.appointments }}
          more={more("appointments")}
        >
          <FigureList
            figures={STATUSES.map((status) => ({
              label: t.appointments.statuses[status],
              value: summary.appointments[status],
              alert: status === "MISSED",
              of: appointmentsTotal,
            }))}
          />
        </ReportCard>

        <ReportCard
          id="report-visits"
          icon={CheckupIcon}
          title={s.visits.title}
          total={{ value: summary.visits.completed, label: s.totals.visits }}
          more={more("visits")}
          className="xl:col-span-2"
        >
          {/* From 1280px the two figures share one row and the chart runs the full width under them. */}
          <FigureList
            columns
            figures={[
              { label: s.visits.mothers, value: summary.visits.mothers },
              { label: s.visits.walkIns, value: summary.visits.walkIns, of: summary.visits.completed },
            ]}
          />
          <VisitsChart
            t={t}
            locale={locale}
            grouping={summary.visits.grouping}
            buckets={summary.visits.buckets}
            className="mt-4 border-t border-line pt-4 xl:mt-5 xl:border-t-0 xl:pt-0"
          />
        </ReportCard>

        <ReportCard
          id="report-services"
          icon={ActivityTypesIcon}
          title={s.services.title}
          note={s.services.note}
          total={{ value: servicesTotal, label: s.totals.services }}
          more={more("services")}
          className="xl:col-span-2"
        >
          {servicesTotal === 0 ? (
            <p className="py-2 text-[0.95rem] text-ink-soft">{s.services.none}</p>
          ) : (
            <FigureList columns figures={summary.services.map((service) => ({ label: service.name, value: service.count, of: servicesTotal }))} />
          )}
        </ReportCard>

        {sms && (
          <ReportCard
            id="report-sms"
            icon={SmsIcon}
            title={s.sms.title}
            note={s.sms.note}
            total={{ value: smsTotal, label: s.totals.sms }}
            more={more("sms")}
            className="xl:col-span-2"
          >
            <FigureList
              columns
              figures={[
                { label: s.sms.sent, value: sms.sent, of: smsTotal },
                { label: s.sms.delivered, value: sms.delivered, sub: true, of: smsTotal },
                { label: s.sms.failed, value: sms.failed, alert: true, of: smsTotal },
                { label: s.sms.notSent, value: sms.notSent, of: smsTotal },
                { label: s.sms.waiting, value: sms.waiting, of: smsTotal },
              ]}
            />
          </ReportCard>
        )}
      </div>
    </div>
  );
}
