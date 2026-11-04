import { DangerIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatReportClock, formatReportDay } from "../format";
import { motherRecordHref, visitHref } from "../paths";
import type { ReportFilters, VisitReportRow } from "../types";
import { byMonth, CellLink, DetailFrame, DetailRow, MotherCell, ROW, TD } from "./detail-bits";

// The period's completed visits, oldest first, with key vitals and services
// (no notes). In the table the date opens the visit and her name her record;
// a stacked row opens the visit. Blood pressure of 140/90 or more is
// rose-deep with a warning mark, as on the Visits page.
export function VisitsDetail({ t, locale, filters, rows }: { t: Dictionary; locale: Locale; filters: ReportFilters; rows: VisitReportRow[] }) {
  const d = t.reports.detail;
  const c = d.columns;
  const kind = (row: VisitReportRow) => (row.walkIn ? d.walkIn : d.booked);
  const services = (row: VisitReportRow) => (row.services.length > 0 ? row.services.join(", ") : t.visits.noServices);
  const weight = (row: VisitReportRow) => format(d.weight, { kg: row.weightKg });
  const week = (row: VisitReportRow) => format(t.visits.weekShort, { weeks: row.weeks });
  const recordedBy = (row: VisitReportRow) => row.recordedBy ?? d.missing;

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="visits"
      columns={[c.date, c.mother, c.week, c.bp, c.weight, c.services, c.recordedBy]}
      groups={byMonth(rows, (row) => row.at, filters, locale)}
      row={(row) => (
        <tr key={row.id} className={ROW}>
          <td className={`${TD} whitespace-nowrap print:whitespace-normal`}>
            <span className="flex flex-col items-start gap-0.5">
              <CellLink href={visitHref(row.id)}>{formatReportDay(row.at, locale)}</CellLink>
              <span className="text-sm whitespace-nowrap text-ink-soft">
                <span className="tnum">{formatReportClock(row.at, locale)}</span>
                {" · "}
                {kind(row)}
              </span>
            </span>
          </td>
          <td className={TD}>
            <MotherCell t={t} mother={row.mother} href={motherRecordHref(row.mother.id, "visits")} />
          </td>
          <td className={`${TD} whitespace-nowrap`}>{week(row)}</td>
          <td className={`${TD} whitespace-nowrap`}>
            <Bp t={t} bp={row.bp} />
          </td>
          <td className={`${TD} tnum whitespace-nowrap`}>{weight(row)}</td>
          <td className={`${TD} max-w-56`}>{services(row)}</td>
          <td className={TD}>{recordedBy(row)}</td>
        </tr>
      )}
      item={(row) => (
        <DetailRow
          key={row.id}
          name={row.mother.name}
          href={visitHref(row.id)}
          label={format(t.visits.list.openLabel, { name: row.mother.name })}
          aside={<span className="tnum whitespace-nowrap">{formatReportDay(row.at, locale)}</span>}
        >
          <span className="text-sm text-ink-soft">
            {row.mother.purok ?? t.mothers.noPurokYet}
            {" · "}
            <span className="tnum whitespace-nowrap">{formatReportClock(row.at, locale)}</span>
            {" · "}
            <span className="whitespace-nowrap">{kind(row)}</span>
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-soft">
            <span className="font-semibold whitespace-nowrap text-ink">{week(row)}</span>
            <span className="whitespace-nowrap">
              {c.bp} <Bp t={t} bp={row.bp} />
            </span>
            <span className="tnum whitespace-nowrap">{weight(row)}</span>
          </span>
          <span className="text-sm text-ink">{services(row)}</span>
          <span className="text-sm text-ink-soft">{`${c.recordedBy}: ${recordedBy(row)}`}</span>
        </DetailRow>
      )}
    />
  );
}

/** "110/70"; 140/90 or more turns rose-deep with a warning mark (and says so to screen readers). */
function Bp({ t, bp }: { t: Dictionary; bp: string }) {
  const [systolic, diastolic] = bp.split("/").map(Number);
  const high = systolic >= 140 || diastolic >= 90;
  if (!high) return <span className="tnum text-ink">{bp}</span>;
  return (
    <span className="tnum inline-flex items-center gap-1 font-bold text-rose-deep">
      <DangerIcon weight="fill" aria-hidden className="size-4 shrink-0 print:hidden" />
      {bp}
      <span className="sr-only">{` (${t.visits.list.bpHigh})`}</span>
    </span>
  );
}
