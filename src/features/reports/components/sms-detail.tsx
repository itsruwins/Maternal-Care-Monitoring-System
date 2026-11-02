import { SmsStatusChip, SmsStatusDetail, smsAbout } from "@/features/sms/components/sms-bits";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { motherRecordHref } from "../paths";
import type { SmsReportRow } from "../types";
import { DetailCard, DetailFrame, MotherCell, TD, TH } from "./detail-bits";

// Admins only: the period's texts, oldest first, with the SMS log's chips.
// No phone numbers and no message text (the SMS log has both).
export function SmsDetail({ t, locale, rows }: { t: Dictionary; locale: Locale; rows: SmsReportRow[] }) {
  const c = t.reports.detail.columns;
  const l = t.sms.log;
  const text = (row: SmsReportRow) => (
    <div className="flex flex-col items-start gap-0.5">
      <span className="font-medium">{l.types[row.type]}</span>
      <span className="text-sm text-ink-soft">{smsAbout(t, locale, row)}</span>
    </div>
  );
  const status = (row: SmsReportRow) => (
    <div className="flex flex-col items-start gap-1">
      <SmsStatusChip t={t} item={row} />
      <SmsStatusDetail t={t} locale={locale} item={row} />
    </div>
  );
  const mother = (row: SmsReportRow) => (
    <MotherCell t={t} mother={{ ...row.mother, purok: row.purok }} href={motherRecordHref(row.mother.id, "sms")} />
  );

  return (
    <DetailFrame
      t={t}
      count={rows.length}
      countKey="sms"
      table={
        <>
          <thead className="border-b border-line text-caption text-ink-soft">
            <tr>
              <th scope="col" className={TH}>{c.mother}</th>
              <th scope="col" className={TH}>{c.text}</th>
              <th scope="col" className={TH}>{c.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className={`${TD} w-[28%]`}>{mother(row)}</td>
                <td className={TD}>{text(row)}</td>
                <td className={`${TD} w-[30%]`}>{status(row)}</td>
              </tr>
            ))}
          </tbody>
        </>
      }
      cards={rows.map((row) => (
        <DetailCard key={row.id} top={status(row)} mother={mother(row)} fields={[{ label: c.text, value: text(row) }]} />
      ))}
    />
  );
}
