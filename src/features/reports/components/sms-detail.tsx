import { SmsStatusChip, SmsStatusDetail, smsAbout } from "@/features/sms/components/sms-bits";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { motherRecordHref } from "../paths";
import type { ReportFilters, SmsReportRow } from "../types";
import { byMonth, DetailFrame, DetailRow, MotherCell, ROW, TD } from "./detail-bits";

// Admins only: the period's texts, oldest first, with the SMS log's chips.
// No phone numbers and no message text (the SMS log has both). Her name
// opens her record's SMS tab.
export function SmsDetail({ t, locale, filters, rows }: { t: Dictionary; locale: Locale; filters: ReportFilters; rows: SmsReportRow[] }) {
  const c = t.reports.detail.columns;
  const l = t.sms.log;
  const text = (row: SmsReportRow) => (
    <span className="flex flex-col items-start gap-0.5">
      <span className="font-medium text-ink">{l.types[row.type]}</span>
      <span className="text-sm text-ink-soft">{smsAbout(t, locale, row)}</span>
    </span>
  );
  const href = (row: SmsReportRow) => motherRecordHref(row.mother.id, "sms");

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="sms"
      columns={[c.mother, c.text, c.status]}
      groups={byMonth(rows, (row) => row.at, filters, locale)}
      row={(row) => (
        <tr key={row.id} className={ROW}>
          <td className={`${TD} w-[30%]`}>
            <MotherCell t={t} mother={{ ...row.mother, purok: row.purok }} href={href(row)} />
          </td>
          <td className={TD}>{text(row)}</td>
          <td className={`${TD} w-[30%]`}>
            <span className="flex flex-col items-start gap-1">
              <SmsStatusChip t={t} item={row} />
              <SmsStatusDetail t={t} locale={locale} item={row} />
            </span>
          </td>
        </tr>
      )}
      item={(row) => (
        <DetailRow key={row.id} name={row.mother.name} href={href(row)} aside={<SmsStatusChip t={t} item={row} />}>
          <span className="text-sm text-ink-soft">{row.purok ?? t.mothers.noPurokYet}</span>
          <span className="text-sm">{text(row)}</span>
          <span className="text-sm text-ink-soft">
            <SmsStatusDetail t={t} locale={locale} item={row} />
          </span>
        </DetailRow>
      )}
    />
  );
}
