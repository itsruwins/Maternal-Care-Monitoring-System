import { StatusChip } from "@/features/appointments/components/appointment-bits";
import { EndingChip } from "@/features/follow-ups/components/follow-up-bits";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportClock, formatReportDay } from "../format";
import { motherRecordHref } from "../paths";
import type { AppointmentReportRow } from "../types";
import { DetailCard, DetailFrame, MotherCell, TD, TH } from "./detail-bits";

// The period's appointments, oldest first. A request without a time yet is
// placed at the time she asked for. A missed one shows its follow-up.
export function AppointmentsDetail({ t, locale, rows }: { t: Dictionary; locale: Locale; rows: AppointmentReportRow[] }) {
  const d = t.reports.detail;
  const c = d.columns;
  const f = t.followUps;
  const when = (row: AppointmentReportRow) => {
    // Day and time stay on one line.
    const time = `${formatReportDay(row.at, locale)}\u00a0·\u00a0${formatReportClock(row.at, locale)}`;
    return row.asked ? <span className="text-ink-soft">{format(d.asked, { when: time })}</span> : time;
  };
  const followUp = (row: AppointmentReportRow) => {
    const item = row.followUp;
    if (!item) return null;
    if (item.ending) return <EndingChip t={t} locale={locale} ending={item.ending} />;
    const tries = item.attempts === 0 ? f.notContacted : [item.attempts === 1 ? f.triesOne : format(f.tries, { count: item.attempts }), item.lastResult && f.outcomes[item.lastResult]].filter(Boolean).join(" · ");
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-rose-deep">{d.followUpOpen}</span>
        <span className="text-sm text-ink-soft">{tries}</span>
      </div>
    );
  };
  const mother = (row: AppointmentReportRow) => <MotherCell t={t} mother={row.mother} href={motherRecordHref(row.mother.id, "appointments")} />;

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="appointments"
      table={
        <>
          <thead className="border-b border-line text-caption text-ink-soft">
            <tr>
              <th scope="col" className={TH}>{c.when}</th>
              <th scope="col" className={TH}>{c.mother}</th>
              <th scope="col" className={TH}>{c.service}</th>
              <th scope="col" className={TH}>{c.status}</th>
              <th scope="col" className={TH}>{c.followUp}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className={`${TD} tnum w-[22%]`}>{when(row)}</td>
                <td className={`${TD} w-[24%]`}>{mother(row)}</td>
                <td className={TD}>{row.service}</td>
                <td className={TD}>
                  <StatusChip t={t} status={row.status} />
                </td>
                <td className={`${TD} w-[22%]`}>{followUp(row)}</td>
              </tr>
            ))}
          </tbody>
        </>
      }
      cards={rows.map((row) => (
        <DetailCard
          key={row.id}
          top={<StatusChip t={t} status={row.status} />}
          mother={mother(row)}
          fields={[
            { label: c.when, value: when(row) },
            { label: c.service, value: row.service },
            ...(row.followUp ? [{ label: c.followUp, value: followUp(row) }] : []),
          ]}
        />
      ))}
    />
  );
}
