import type { AppointmentStatus, PregnancyOutcome } from "@/types/database";

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
};

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
