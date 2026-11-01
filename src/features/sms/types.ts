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
