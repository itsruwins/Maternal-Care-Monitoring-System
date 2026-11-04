import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportDay } from "../format";
import { motherRecordHref } from "../paths";
import type { PregnancyReportRow } from "../types";
import { DetailFrame, DetailRow, MotherCell, ROW, TD } from "./detail-bits";

// The period's pregnancies, soonest due date first (no month headings: the
// order is by due date). Her name opens her record's Pregnancy tab.
export function PregnanciesDetail({ t, locale, rows }: { t: Dictionary; locale: Locale; rows: PregnancyReportRow[] }) {
  const d = t.reports.detail;
  const c = d.columns;
  const day = (iso: string | null) => (iso ? formatReportDay(iso, locale) : d.missing);
  const status = (row: PregnancyReportRow) =>
    row.status === "ACTIVE" || !row.outcome
      ? d.stillPregnant
      : format(t.mothers.outcomeOn, { outcome: t.mothers.outcomes[row.outcome], date: row.outcomeDate ? formatReportDay(row.outcomeDate, locale) : "" });
  const gp = (row: PregnancyReportRow) => format(d.gp, { gravida: row.gravida, para: row.para });
  const href = (row: PregnancyReportRow) => motherRecordHref(row.mother.id, "pregnancy");

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="pregnancies"
      columns={[c.mother, c.registered, c.lmp, c.due, c.gp, c.status]}
      groups={[{ key: "all", label: null, rows }]}
      row={(row) => (
        <tr key={row.id} className={ROW}>
          <td className={TD}>
            <MotherCell t={t} mother={row.mother} href={href(row)} />
          </td>
          <td className={`${TD} tnum whitespace-nowrap`}>{day(row.registered)}</td>
          <td className={`${TD} tnum whitespace-nowrap`}>{day(row.lmp)}</td>
          <td className={`${TD} tnum font-semibold whitespace-nowrap`}>{day(row.due)}</td>
          <td className={`${TD} tnum whitespace-nowrap`}>{gp(row)}</td>
          <td className={TD}>{status(row)}</td>
        </tr>
      )}
      item={(row) => (
        <DetailRow key={row.id} name={row.mother.name} href={href(row)} aside={<span className="tnum whitespace-nowrap">{day(row.due)}</span>}>
          <span className="text-sm text-ink-soft">{row.mother.purok ?? t.mothers.noPurokYet}</span>
          <span className="text-sm font-medium text-ink">{status(row)}</span>
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-ink-soft">
            <span className="tnum whitespace-nowrap">{gp(row)}</span>
            <span className="whitespace-nowrap">{`${c.lmp} ${day(row.lmp)}`}</span>
            <span className="whitespace-nowrap">{`${c.registered} ${day(row.registered)}`}</span>
          </span>
        </DetailRow>
      )}
    />
  );
}
