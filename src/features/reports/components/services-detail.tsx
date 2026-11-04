import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportDay } from "../format";
import { motherRecordHref, visitHref } from "../paths";
import type { ReportFilters, ServiceReportRow } from "../types";
import { byMonth, CellLink, DetailFrame, DetailRow, MotherCell, ROW, TD } from "./detail-bits";

// Each service given in the period, oldest first (no result notes). In the
// table the date opens the visit it was given at; a stacked row opens it too.
export function ServicesDetail({ t, locale, filters, rows }: { t: Dictionary; locale: Locale; filters: ReportFilters; rows: ServiceReportRow[] }) {
  const d = t.reports.detail;
  const c = d.columns;
  const details = (row: ServiceReportRow) => row.details || d.missing;
  const recordedBy = (row: ServiceReportRow) => row.recordedBy ?? d.missing;

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="services"
      columns={[c.date, c.mother, c.service, c.details, c.recordedBy]}
      groups={byMonth(rows, (row) => row.at, filters, locale)}
      row={(row) => (
        <tr key={row.id} className={ROW}>
          <td className={`${TD} whitespace-nowrap`}>
            <CellLink href={visitHref(row.visitId)}>{formatReportDay(row.at, locale)}</CellLink>
          </td>
          <td className={TD}>
            <MotherCell t={t} mother={row.mother} href={motherRecordHref(row.mother.id, "visits")} />
          </td>
          <td className={`${TD} font-medium`}>{row.service}</td>
          <td className={TD}>{details(row)}</td>
          <td className={TD}>{recordedBy(row)}</td>
        </tr>
      )}
      item={(row) => (
        <DetailRow
          key={row.id}
          name={row.mother.name}
          href={visitHref(row.visitId)}
          label={format(t.visits.list.openLabel, { name: row.mother.name })}
          aside={<span className="tnum whitespace-nowrap">{formatReportDay(row.at, locale)}</span>}
        >
          <span className="text-sm text-ink-soft">{row.mother.purok ?? t.mothers.noPurokYet}</span>
          <span className="text-sm">
            <span className="font-medium text-ink">{row.service}</span>
            <span className="block text-ink-soft">{details(row)}</span>
          </span>
          <span className="text-sm text-ink-soft">{`${c.recordedBy}: ${recordedBy(row)}`}</span>
        </DetailRow>
      )}
    />
  );
}
