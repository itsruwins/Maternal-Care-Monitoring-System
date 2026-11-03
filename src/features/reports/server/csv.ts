import "server-only";
import { endingText } from "@/features/follow-ups/components/follow-up-bits";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { type Cell, csvCell } from "../csv-cell";
import { bucketName } from "../format";
import type { ReportFilters, ReportMother, ReportRows, ReportSummary } from "../types";

// A report tab as CSV: UTF-8 with a byte-order mark (so ñ opens correctly in
// Excel), CRLF lines, headers in the app's language. Dates are YYYY-MM-DD and
// times 24-hour HH:mm (Manila), in their own columns, so Excel sorts them.
// Name and purok, never a phone number, address or notes.

/** "2026-11-05" in Manila for an instant ("2026-11-05" stays as is). */
const csvDate = (iso: string | null) => (iso ? (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : manilaTodayISO(new Date(iso))) : "");
/** "14:30" in Manila. */
const csvTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));

/** The download's file name: taysan-visits-2026-11-01-to-2026-11-30.csv. */
export const csvFileName = (filters: ReportFilters) => `taysan-${filters.tab}-${filters.from}-to-${filters.to}.csv`;

export function reportCsv(t: Dictionary, locale: Locale, data: { summary: ReportSummary } | { rows: ReportRows }): string {
  const table = "summary" in data ? summaryTable(t, locale, data.summary) : rowsTable(t, locale, data.rows);
  return "﻿" + table.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

function rowsTable(t: Dictionary, locale: Locale, data: ReportRows): Cell[][] {
  const c = t.reports.detail.columns;
  const x = t.reports.csv;
  const d = t.reports.detail;
  const who = (m: ReportMother): Cell[] => [m.name, m.purok ?? t.mothers.noPurokYet];

  switch (data.tab) {
    case "pregnancies":
      return [
        [c.mother, c.purok, c.registered, c.lmp, c.due, x.gravida, x.para, c.status, x.outcomeDate],
        ...data.rows.map((r) => [
          ...who(r.mother),
          r.registered,
          csvDate(r.lmp),
          csvDate(r.due),
          r.gravida,
          r.para,
          r.status === "ACTIVE" || !r.outcome ? d.stillPregnant : t.mothers.outcomes[r.outcome],
          csvDate(r.outcomeDate),
        ]),
      ];
    case "visits":
      return [
        [c.date, x.time, c.mother, c.purok, c.week, c.bp, x.weightKg, c.services, c.kind, c.recordedBy],
        ...data.rows.map((r) => [
          csvDate(r.at),
          csvTime(r.at),
          ...who(r.mother),
          r.weeks,
          r.bp,
          r.weightKg,
          r.services.join("; "),
          r.walkIn ? d.walkIn : d.booked,
          r.recordedBy ?? "",
        ]),
      ];
    case "appointments":
      return [
        [c.date, x.time, c.mother, c.purok, c.service, c.status, c.followUp],
        ...data.rows.map((r) => [csvDate(r.at), csvTime(r.at), ...who(r.mother), r.service, t.appointments.statuses[r.status], followUpText(t, locale, r.followUp)]),
      ];
    case "services":
      return [
        [c.date, x.time, c.mother, c.purok, c.service, c.details, c.recordedBy],
        ...data.rows.map((r) => [csvDate(r.at), csvTime(r.at), ...who(r.mother), r.service, r.details, r.recordedBy ?? ""]),
      ];
    case "sms": {
      const l = t.sms.log;
      return [
        [c.date, x.time, c.mother, c.purok, t.reports.filters.type, c.service, x.visitDate, x.visitTime, c.status, x.reason],
        ...data.rows.map((r) => [
          csvDate(r.at),
          csvTime(r.at),
          r.mother.name,
          r.purok ?? t.mothers.noPurokYet,
          l.types[r.type],
          r.service,
          csvDate(r.visitAt),
          csvTime(r.visitAt),
          l.statuses[r.retrying ? "retrying" : r.status],
          r.reason ? (l.reasons[r.reason as keyof typeof l.reasons] ?? "") : "",
        ]),
      ];
    }
  }
}

function followUpText(t: Dictionary, locale: Locale, item: Extract<ReportRows, { tab: "appointments" }>["rows"][number]["followUp"]): string {
  if (!item) return "";
  if (item.ending) return endingText(t, locale, item.ending);
  const f = t.followUps;
  const tries = item.attempts === 0 ? f.notContacted : item.attempts === 1 ? f.triesOne : format(f.tries, { count: item.attempts });
  return [t.reports.detail.followUpOpen, tries, item.lastResult && f.outcomes[item.lastResult]].filter(Boolean).join(" · ");
}

function summaryTable(t: Dictionary, locale: Locale, s: ReportSummary): Cell[][] {
  const x = t.reports.csv;
  const m = t.reports.summary;
  const rows: Cell[][] = [[x.section, x.item, x.count]];
  const add = (section: string, items: [string, number][]) => rows.push(...items.map(([item, count]) => [section, item, count]));
  const servicesTotal = s.services.reduce((sum, service) => sum + service.count, 0);
  const closed = Object.values(s.pregnancies.closed).reduce((sum, n) => sum + n, 0);

  add(x.totals, [
    [m.tiles.pregnant, s.pregnancies.active],
    [m.tiles.visits, s.visits.completed],
    [m.tiles.missed, s.appointments.MISSED],
    [m.tiles.services, servicesTotal],
  ]);
  add(m.pregnancies.title, [
    [m.pregnancies.active, s.pregnancies.active],
    [m.pregnancies.added, s.pregnancies.added],
    [m.pregnancies.closed, closed],
    ...(["LIVE_BIRTH", "STILLBIRTH", "MISCARRIAGE", "OTHER"] as const).map((o): [string, number] => [t.mothers.outcomes[o], s.pregnancies.closed[o]]),
  ]);
  add(m.visits.title, [
    [m.visits.completed, s.visits.completed],
    [m.visits.mothers, s.visits.mothers],
    [m.visits.walkIns, s.visits.walkIns],
  ]);
  add(
    s.visits.grouping === "week" ? m.visits.chartWeek : m.visits.chartMonth,
    s.visits.buckets.map((b): [string, number] => [bucketName(b.start, b.end, s.visits.grouping, locale), b.count]),
  );
  add(
    m.appointments.title,
    (["REQUESTED", "CONFIRMED", "RESCHEDULED", "COMPLETED", "MISSED", "CANCELLED"] as const).map((st): [string, number] => [t.appointments.statuses[st], s.appointments[st]]),
  );
  add(m.services.title, s.services.map((service): [string, number] => [service.name, service.count]));
  if (s.sms) {
    add(m.sms.title, [
      [m.sms.sent, s.sms.sent],
      [m.sms.delivered, s.sms.delivered],
      [m.sms.failed, s.sms.failed],
      [m.sms.notSent, s.sms.notSent],
      [m.sms.waiting, s.sms.waiting],
    ]);
  }
  return rows;
}
