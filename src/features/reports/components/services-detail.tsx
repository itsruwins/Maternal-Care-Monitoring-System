import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportDay } from "../format";
import { motherRecordHref, visitHref } from "../paths";
import type { ServiceReportRow } from "../types";
import { CellLink, DetailCard, DetailFrame, MotherCell, TD, TH } from "./detail-bits";

// Each service given in the period, oldest first (no result notes). The date
// opens the visit it was given at.
export function ServicesDetail({ t, locale, rows }: { t: Dictionary; locale: Locale; rows: ServiceReportRow[] }) {
  const d = t.reports.detail;
  const c = d.columns;
  const date = (row: ServiceReportRow) => <CellLink href={visitHref(row.visitId)}>{formatReportDay(row.at, locale)}</CellLink>;
  const details = (row: ServiceReportRow) => row.details || d.missing;
  const recordedBy = (row: ServiceReportRow) => row.recordedBy ?? d.missing;
  const mother = (row: ServiceReportRow) => <MotherCell t={t} mother={row.mother} href={motherRecordHref(row.mother.id, "visits")} />;

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="services"
      table={
        <>
          <thead className="border-b border-line text-caption text-ink-soft">
            <tr>
              <th scope="col" className={TH}>{c.date}</th>
              <th scope="col" className={TH}>{c.mother}</th>
              <th scope="col" className={TH}>{c.service}</th>
              <th scope="col" className={TH}>{c.details}</th>
              <th scope="col" className={TH}>{c.recordedBy}</th>
            </tr>
          </thead>
          <tbody className="tnum divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className={`${TD} whitespace-nowrap`}>{date(row)}</td>
                <td className={`${TD} w-[24%]`}>{mother(row)}</td>
                <td className={`${TD} font-medium`}>{row.service}</td>
                <td className={TD}>{details(row)}</td>
                <td className={TD}>{recordedBy(row)}</td>
              </tr>
            ))}
          </tbody>
        </>
      }
      cards={rows.map((row) => (
        <DetailCard
          key={row.id}
          top={
            <>
              <p className="font-semibold">{row.service}</p>
              {date(row)}
            </>
          }
          mother={mother(row)}
          fields={[
            { label: c.details, value: details(row) },
            { label: c.recordedBy, value: recordedBy(row) },
          ]}
        />
      ))}
    />
  );
}
