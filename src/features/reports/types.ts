import type { SmsLogItem } from "@/features/sms/types";
import type { AppointmentStatus, FollowUpEnding, FollowUpCloseReason, FollowUpResult, PregnancyOutcome, PregnancyStatus } from "@/types/database";

export type ReportTab = "summary" | "pregnancies" | "visits" | "appointments" | "services" | "sms";
export type ReportPeriod = "this-month" | "last-month" | "this-year" | "custom";

/** What the address asks for (?tab=&period=&from=&to=&purok=&service=), made safe. */
export type ReportFilters = {
  tab: ReportTab;
  period: ReportPeriod;
  /** First and last day of the period, "YYYY-MM-DD" (Manila), always set. */
  from: string;
  to: string;
  /** A purok id, "none" (no purok yet) or "" (all). */
  purok: number | "none" | "";
  /** An activity type id or "" (all). Used on Visits, Appointments and Services. */
  service: number | "";
  /** Pregnancies tab: which of the period's pregnancies ("" = all). */
  show: PregnancyShow | "";
  /** Appointments tab: an appointment status; SMS tab: a text status ("" = all). */
  status: AppointmentStatus | SmsStatusFilter | "";
  /** SMS tab: the kind of text ("" = all). */
  type: SmsTypeFilter | "";
};

/** still: not closed by the period's end. added: registered in the period. closed: closed in the period. */
export type PregnancyShow = "still" | "added" | "closed";
/** The SMS log's status choices ("sent" = Sent or Delivered). */
export type SmsStatusFilter = "waiting" | "sent" | "delivered" | "failed" | "skipped";
/** The SMS log's kinds of text. */
export type SmsTypeFilter = "reminder" | "missed" | "answer";

/** Visits over the period, by week (up to 3 months) or by month. */
export type VisitBucket = {
  /** First day of the week or month (clipped to the period). */
  start: string;
  /** Last day (clipped to the period). */
  end: string;
  count: number;
};

export type ReportSummary = {
  pregnancies: {
    /** Registered by the period's end and not closed before its start. */
    active: number;
    /** Registered during the period. */
    added: number;
    /** Closed during the period, by outcome. */
    closed: Record<PregnancyOutcome, number>;
  };
  visits: {
    completed: number;
    /** Different mothers seen. */
    mothers: number;
    /** Visits without an appointment. */
    walkIns: number;
    grouping: "week" | "month";
    buckets: VisitBucket[];
  };
  /** Appointments whose time falls in the period, by status. */
  appointments: Record<AppointmentStatus, number>;
  /** Services given at the period's visits, every service (0 included), most first. */
  services: { id: number; name: string; count: number }[];
  /** Texts in the period (admins only; null for health workers). */
  sms: { sent: number; delivered: number; failed: number; notSent: number; waiting: number } | null;
};

export type ReportService = { id: number; name: string };

/** A mother as a report row shows her. */
export type ReportMother = { id: number; name: string; purok: string | null };

export type PregnancyReportRow = {
  id: number;
  mother: ReportMother;
  registered: string;
  lmp: string | null;
  due: string | null;
  gravida: number;
  para: number;
  status: PregnancyStatus;
  outcome: PregnancyOutcome | null;
  outcomeDate: string | null;
};

export type VisitReportRow = {
  id: number;
  at: string;
  mother: ReportMother;
  weeks: number;
  bp: string;
  weightKg: number;
  services: string[];
  walkIn: boolean;
  recordedBy: string | null;
};

export type AppointmentReportRow = {
  id: number;
  /** The appointment's time, or the time she asked for while it's a request. */
  at: string;
  /** No time set yet: `at` is the asked time. */
  asked: boolean;
  mother: ReportMother;
  service: string;
  status: AppointmentStatus;
  /** A missed appointment's follow-up (null for other statuses). */
  followUp: {
    open: boolean;
    attempts: number;
    lastResult: FollowUpResult | null;
    ending: { how: FollowUpEnding; at: string | null; closeReason: FollowUpCloseReason | null; rebookedAt: string | null } | null;
  } | null;
};

export type ServiceReportRow = {
  id: number;
  at: string;
  visitId: number;
  mother: ReportMother;
  service: string;
  details: string;
  recordedBy: string | null;
};

export type SmsReportRow = SmsLogItem & { purok: string | null };

/** A detail tab's rows (every row in the period, oldest first). */
export type ReportRows =
  | { tab: "pregnancies"; rows: PregnancyReportRow[] }
  | { tab: "visits"; rows: VisitReportRow[] }
  | { tab: "appointments"; rows: AppointmentReportRow[] }
  | { tab: "services"; rows: ServiceReportRow[] }
  | { tab: "sms"; rows: SmsReportRow[] };
