/** Which greeting to use: Manila time before noon, before 6 PM, then evening. */
export type DayPart = "morning" | "afternoon" | "evening";

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

/** The short line under each count (what the number is made of). */
export type DashboardContext = {
  /** Today's appointments already done (Completed). */
  todayDone: number;
  /** Today's appointments marked Missed. */
  todayMissed: number;
  /** When the longest-waiting request was sent. */
  oldestRequestAt: string | null;
  /** When the oldest open missed visit was. */
  oldestMissedAt: string | null;
  /** Current pregnancies at 28 weeks or more (due within 12 weeks, past due included). */
  thirdTrimester: number;
  /** Current pregnancies whose due date has passed. */
  pastDue: number;
};

/** A waiting request on the "Needs attention" card. */
export type RequestItem = {
  appointmentId: number;
  motherId: number;
  name: string;
  service: string;
  /** The time she asked for. */
  at: string;
};

/** An open missed visit on the "Needs attention" card. */
export type FollowUpItem = {
  appointmentId: number;
  motherId: number;
  name: string;
  service: string;
  missedAt: string;
};

/** Completed visits on one day (Manila), for the 30-day chart. */
export type VisitDay = { date: string; count: number };

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
