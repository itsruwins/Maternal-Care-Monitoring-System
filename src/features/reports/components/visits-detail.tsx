import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportClock, formatReportDay } from "../format";
import { motherRecordHref, visitHref } from "../paths";
import type { VisitReportRow } from "../types";
import { CellLink, DetailCard, DetailFrame, MotherCell, TD, TH } from "./detail-bits";

// The period's completed visits, oldest first, with key vitals and services
// (no notes). The date opens the visit.
export function VisitsDetail({ t, locale, rows }: { t: Dictionary; locale: Locale; rows: VisitReportRow[] }) {
  const d = t.reports.detail;
  const c = d.columns;
  const when = (row: VisitReportRow) => (
    <div className="flex flex-col items-start gap-0.5">
      <CellLink href={visitHref(row.id)}>{formatReportDay(row.at, locale)}</CellLink>
      <span className="text-sm text-ink-soft">
        {formatReportClock(row.at, locale)} · {row.walkIn ? d.walkIn : d.booked}
      </span>
    </div>
  );
  const services = (row: VisitReportRow) => (row.services.length > 0 ? row.services.join(", ") : t.visits.noServices);
  const weight = (row: VisitReportRow) => format(d.weight, { kg: row.weightKg });
  const recordedBy = (row: VisitReportRow) => row.recordedBy ?? d.missing;
  const mother = (row: VisitReportRow) => <MotherCell t={t} mother={row.mother} href={motherRecordHref(row.mother.id, "visits")} />;

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="visits"
      table={
        <>
          <thead className="border-b border-line text-caption text-ink-soft">
            <tr>
              <th scope="col" className={TH}>{c.date}</th>
              <th scope="col" className={TH}>{c.mother}</th>
              <th scope="col" className={TH}>{c.week}</th>
              <th scope="col" className={TH}>{c.bp}</th>
              <th scope="col" className={TH}>{c.weight}</th>
              <th scope="col" className={TH}>{c.services}</th>
              <th scope="col" className={TH}>{c.recordedBy}</th>
            </tr>
          </thead>
          <tbody className="tnum divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className={`${TD} whitespace-nowrap`}>{when(row)}</td>
                <td className={`${TD} w-[22%]`}>{mother(row)}</td>
                <td className={`${TD} whitespace-nowrap`}>{row.weeks}</td>
                <td className={`${TD} whitespace-nowrap`}>{row.bp}</td>
                <td className={`${TD} whitespace-nowrap`}>{weight(row)}</td>
                <td className={TD}>{services(row)}</td>
                <td className={TD}>{recordedBy(row)}</td>
              </tr>
            ))}
          </tbody>
        </>
      }
      cards={rows.map((row) => (
        <DetailCard
          key={row.id}
          top={when(row)}
          mother={mother(row)}
          fields={[
            { label: c.week, value: row.weeks },
            { label: c.bp, value: row.bp },
            { label: c.weight, value: weight(row) },
            { label: c.services, value: services(row) },
            { label: c.recordedBy, value: recordedBy(row) },
          ]}
        />
      ))}
    />
  );
}
