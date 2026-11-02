/** The five counts at the top of the staff dashboard. */
export type DashboardCounts = {
  /** Appointments booked for today (open, missed or done), as on the Visits page. */
  today: number;
  /** Requests waiting for an answer (the Requests tab). */
  requests: number;
  /** Missed visits still open on the follow-up list. */
  followUps: number;
  /** Current (ACTIVE) pregnancies. */
  pregnant: number;
  /** Current pregnancies due by today + 30 days, past due included. */
  dueSoon: number;
};

/** One pregnancy on the "Due within 30 days" list. */
export type DueSoonItem = {
  pregnancyId: number;
  motherId: number;
  name: string;
  purok: string | null;
  dueDate: string;
  /** Days from today to the due date: negative when past due. */
  daysLeft: number;
  weeks: number | null;
};

/** Admin section: accounts and mothers. */
export type AccountCounts = {
  /** Every mother record (with or without a login). */
  mothers: number;
  mothersWithLogin: number;
  mothersWithoutLogin: number;
  /** Mothers who signed up on the website this month (Manila). */
  signedUpThisMonth: number;
  healthWorkers: number;
  admins: number;
  /** Logins of any role that are switched off. */
  inactive: number;
};

/** Admin section: the SMS phone, this month's texts and the plan limit. */
export type SmsHealth = {
  phoneOnline: boolean | null;
  phoneStatusAt: string | null;
  /** When HTTPSMS last refused texts for the monthly limit. */
  limitReachedAt: string | null;
  /** Texts that went out this month (counts against the plan). */
  sentThisMonth: number;
  deliveredThisMonth: number;
  failedThisMonth: number;
  skippedThisMonth: number;
  /** Waiting to go out now. */
  waiting: number;
  /** Every Failed text (the SMS log's Failed count). */
  failed: number;
  limit: number;
};

export type AdminDashboard = { accounts: AccountCounts; sms: SmsHealth };
