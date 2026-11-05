import type { UserRole } from "@/types/database";

/** Every kind of notification (enum notification_type, migration 0026). */
export const NOTIFICATION_TYPES = [
  // For her
  "REQUEST_CONFIRMED",
  "REQUEST_NEW_TIME",
  "REQUEST_DECLINED",
  "VISIT_BOOKED",
  "VISIT_REBOOKED",
  "VISIT_MOVED",
  "VISIT_CANCELLED",
  "VISIT_REMINDER",
  "VISIT_MISSED",
  "CHECKUP_RECORDED",
  "PREGNANCY_CLOSED",
  "PASSWORD_RESET",
  // For health workers and admins
  "NEW_REQUEST",
  "MOTHER_CANCELLED",
  "NEW_TIME_ACCEPTED",
  "NEW_TIME_DECLINED",
  "MOTHER_SIGNED_UP",
  "MISSED_SUMMARY",
  // For admins only
  "SMS_FAILED",
  "SMS_PHONE_OFFLINE",
  "SMS_LIMIT_REACHED",
  "ACCOUNT_LOCKED",
  "STAFF_ACCOUNT_CREATED",
  "ACCOUNT_DEACTIVATED",
  "ACCOUNT_REACTIVATED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** What the sentence needs, as saved when it happened (notification.details). */
export type NotificationDetails = {
  service?: string;
  /** The visit's (or event's) time, ISO. */
  at?: string;
  mother_name?: string;
  /** Her appointment's status before she cancelled it. */
  was?: string;
  count?: number;
  /** The Manila day of a missed-visit summary, YYYY-MM-DD. */
  day?: string;
  /** A closed pregnancy's new status (never the outcome). */
  status?: string;
  username?: string;
  role?: UserRole;
  target_user_id?: string;
};

export type NotificationItem = {
  id: number;
  type: NotificationType;
  /** When it happened (a counting notice: when it last counted up), ISO. */
  createdAt: string;
  read: boolean;
  details: NotificationDetails;
  appointmentId: number | null;
  motherId: number | null;
  visitId: number | null;
};

/** Where the next "Show older" starts: just before the oldest one shown. */
export type NotificationCursor = { createdAt: string; id: number };

/** One load of the bell's list: newest first, 20 at a time. */
export type NotificationPage = {
  items: NotificationItem[];
  /** More, older ones exist (within the 90 days kept). */
  hasMore: boolean;
  /** All unread ones, not just this page's. */
  unread: number;
};
