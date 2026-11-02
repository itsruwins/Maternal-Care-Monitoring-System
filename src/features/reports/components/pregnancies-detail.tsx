import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportDay } from "../format";
import { motherRecordHref } from "../paths";
import type { PregnancyReportRow } from "../types";
import { DetailCard, DetailFrame, MotherCell, TD, TH } from "./detail-bits";

// The period's pregnancies, soonest due date first.
export function PregnanciesDetail({ t, locale, rows }: { t: Dictionary; locale: Locale; rows: PregnancyReportRow[] }) {
  const c = t.reports.detail.columns;
  const day = (iso: string | null) => (iso ? formatReportDay(iso, locale) : t.reports.detail.missing);
  const status = (row: PregnancyReportRow) =>
    row.status === "ACTIVE" || !row.outcome
      ? t.reports.detail.stillPregnant
      : format(t.mothers.outcomeOn, { outcome: t.mothers.outcomes[row.outcome], date: row.outcomeDate ? formatReportDay(row.outcomeDate, locale) : "" });
  const gp = (row: PregnancyReportRow) => format(t.reports.detail.gp, { gravida: row.gravida, para: row.para });
  const mother = (row: PregnancyReportRow) => <MotherCell t={t} mother={row.mother} href={motherRecordHref(row.mother.id, "pregnancy")} />;

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="pregnancies"
      table={
        <>
          <thead className="border-b border-line text-caption text-ink-soft">
            <tr>
              <th scope="col" className={TH}>{c.mother}</th>
              <th scope="col" className={TH}>{c.registered}</th>
              <th scope="col" className={TH}>{c.lmp}</th>
              <th scope="col" className={TH}>{c.due}</th>
              <th scope="col" className={TH}>{c.gp}</th>
              <th scope="col" className={TH}>{c.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className={TD}>{mother(row)}</td>
                <td className={`${TD} tnum whitespace-nowrap`}>{day(row.registered)}</td>
                <td className={`${TD} tnum whitespace-nowrap`}>{day(row.lmp)}</td>
                <td className={`${TD} tnum whitespace-nowrap font-semibold`}>{day(row.due)}</td>
                <td className={`${TD} tnum whitespace-nowrap`}>{gp(row)}</td>
                <td className={TD}>{status(row)}</td>
              </tr>
            ))}
          </tbody>
        </>
      }
      cards={rows.map((row) => (
        <DetailCard
          key={row.id}
          mother={mother(row)}
          fields={[
            { label: c.due, value: <span className="font-semibold">{day(row.due)}</span> },
            { label: c.status, value: status(row) },
            { label: c.registered, value: day(row.registered) },
            { label: c.lmp, value: day(row.lmp) },
            { label: c.gp, value: gp(row) },
          ]}
        />
      ))}
    />
  );
}
