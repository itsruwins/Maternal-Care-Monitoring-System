import type { ReminderType, SmsDeliveryStatus } from "@/types/database";

/** Why a text was skipped, is being tried again, or failed (sms_reminder.status_reason). */
export type SmsStatusReason =
  // Too late (from the database's claim_due_sms / clean-ups)
  | "visit_passed"
  | "visit_changed"
  | "notice_late"
  | "follow_up_closed"
  | "answer_late"
  // A visit reminder not needed: her "Confirmed" text goes the same day
  | "covered_by_answer"
  // From the sender
  | "too_long"
  | "bad_characters"
  | "bad_number"
  | "rejected"
  | "send_error"
  | "send_failed"
  | "phone_offline";

/** What one sender run did. */
export type RunSummary = {
  sent: number;
  /** Failed this time, waiting 30 minutes to be tried again. */
  retrying: number;
  failed: number;
  /** Texts HTTPSMS was asked about, and how many of them were delivered. */
  checked: number;
  delivered: number;
  /**
   * Why the run stopped early (the texts it hadn't sent keep waiting):
   * limit = HTTPSMS's monthly limit, auth = the API key was refused,
   * config = HTTPSMS_API_KEY / HTTPSMS_FROM_NUMBER missing, error = the database failed.
   */
  stopped: "limit" | "auth" | "config" | "error" | null;
};

/** The sending controls on /admin/sms. */
export type SendingPanel = {
  phoneOnline: boolean | null;
  phoneStatusAt: string | null;
  limitReachedAt: string | null;
};

/** The SMS log's status filter. "sent": went out (Sent or Delivered). */
export type SmsLogStatus = "waiting" | "sent" | "delivered" | "failed" | "skipped";

/** The SMS log's type filter. "answer": any of the three request answers. */
export type SmsLogType = "reminder" | "missed" | "answer";

export type SmsLogFilters = {
  q: string;
  status: SmsLogStatus | "";
  type: SmsLogType | "";
  /** Manila dates ("YYYY-MM-DD") of shown_at. */
  from: string;
  to: string;
  page: number;
};

/** The counts at the top of the SMS log (each one filters the list). */
export type SmsCounts = { waiting: number; sentToday: number; failed: number };

/** One text on the SMS log or her record's SMS log tab. */
export type SmsLogItem = {
  id: number;
  type: ReminderType;
  status: SmsDeliveryStatus;
  reason: SmsStatusReason | null;
  /** Where it went (sent), or where it will go. */
  number: string;
  text: string;
  /** When it went out, else when it is next due, else when it was first due. */
  at: string;
  /** Waiting for an automatic retry after a failed try. */
  retrying: boolean;
  service: string;
  visitAt: string;
  mother: { id: number; name: string };
};
