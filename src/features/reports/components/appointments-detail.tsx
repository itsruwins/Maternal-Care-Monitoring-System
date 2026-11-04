import { StatusChip } from "@/features/appointments/components/appointment-bits";
import { EndingChip } from "@/features/follow-ups/components/follow-up-bits";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportClock, formatReportDay } from "../format";
import { motherRecordHref } from "../paths";
import type { AppointmentReportRow, ReportFilters } from "../types";
import { byMonth, DetailFrame, DetailRow, MotherCell, ROW, TD } from "./detail-bits";

// The period's appointments, oldest first. A request without a time yet is
// placed at the time she asked for. A missed one shows its follow-up. Her
// name opens her record's Appointments tab.
export function AppointmentsDetail({
  t,
  locale,
  filters,
  rows,
}: {
  t: Dictionary;
  locale: Locale;
  filters: ReportFilters;
  rows: AppointmentReportRow[];
}) {
  const d = t.reports.detail;
  const c = d.columns;
  const f = t.followUps;
  const when = (row: AppointmentReportRow) => {
    // Day and time stay on one line.
    const time = `${formatReportDay(row.at, locale)} · ${formatReportClock(row.at, locale)}`;
    return row.asked ? <span className="text-ink-soft">{format(d.asked, { when: time })}</span> : time;
  };
  const followUp = (row: AppointmentReportRow) => {
    const item = row.followUp;
    if (!item) return null;
    if (item.ending) return <EndingChip t={t} locale={locale} ending={item.ending} />;
    const tries =
      item.attempts === 0
        ? f.notContacted
        : [item.attempts === 1 ? f.triesOne : format(f.tries, { count: item.attempts }), item.lastResult && f.outcomes[item.lastResult]].filter(Boolean).join(" · ");
    return (
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold text-rose-deep">{d.followUpOpen}</span>
        <span className="text-sm text-ink-soft">{tries}</span>
      </span>
    );
  };
  const href = (row: AppointmentReportRow) => motherRecordHref(row.mother.id, "appointments");

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="appointments"
      columns={[c.when, c.mother, c.service, c.status, c.followUp]}
      groups={byMonth(rows, (row) => row.at, filters, locale)}
      row={(row) => (
        <tr key={row.id} className={ROW}>
          <td className={`${TD} tnum w-[22%]`}>{when(row)}</td>
          <td className={TD}>
            <MotherCell t={t} mother={row.mother} href={href(row)} />
          </td>
          <td className={`${TD} min-w-36`}>{row.service}</td>
          <td className={TD}>
            <StatusChip t={t} status={row.status} />
          </td>
          <td className={`${TD} w-[22%]`}>{followUp(row)}</td>
        </tr>
      )}
      item={(row) => (
        <DetailRow key={row.id} name={row.mother.name} href={href(row)} aside={<StatusChip t={t} status={row.status} />}>
          <span className="text-sm text-ink-soft">{row.mother.purok ?? t.mothers.noPurokYet}</span>
          <span className="text-sm">
            <span className="font-medium text-ink">{row.service}</span>
            <span className="tnum block text-ink-soft">{when(row)}</span>
          </span>
          {row.followUp && <span className="mt-1 text-sm">{followUp(row)}</span>}
        </DetailRow>
      )}
    />
  );
}
