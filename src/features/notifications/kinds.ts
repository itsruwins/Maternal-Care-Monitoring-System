import {
  AccountsIcon,
  AppointmentIcon,
  CalendarPlusIcon,
  CallIcon,
  CheckCircleIcon,
  CheckupIcon,
  ClockIcon,
  ClosedDayIcon,
  DangerIcon,
  LockIcon,
  PhoneIcon,
  PregnancyIcon,
  ReminderIcon,
  SmsIcon,
  UserPlusIcon,
  type Icon,
} from "@/components/icons";
import type { NotificationItem, NotificationType } from "./types";

type Tone = "mint" | "beige" | "cream" | "blush";

/**
 * Each kind's icon (inside a soft circle) and the page it opens. The same
 * icon always means the same thing: a check for a yes, the clock for a
 * changed time, the crossed-out calendar for a cancel, blush only for what
 * needs someone (a missed visit, a failed text, a locked login).
 */
export const NOTIFICATION_KINDS: Record<NotificationType, { icon: Icon; tone: Tone }> = {
  REQUEST_CONFIRMED: { icon: CheckCircleIcon, tone: "mint" },
  REQUEST_NEW_TIME: { icon: ClockIcon, tone: "beige" },
  REQUEST_DECLINED: { icon: ClosedDayIcon, tone: "cream" },
  VISIT_BOOKED: { icon: CalendarPlusIcon, tone: "mint" },
  VISIT_REBOOKED: { icon: CalendarPlusIcon, tone: "mint" },
  VISIT_MOVED: { icon: ClockIcon, tone: "beige" },
  VISIT_CANCELLED: { icon: ClosedDayIcon, tone: "cream" },
  VISIT_REMINDER: { icon: ReminderIcon, tone: "mint" },
  VISIT_MISSED: { icon: DangerIcon, tone: "blush" },
  CHECKUP_RECORDED: { icon: CheckupIcon, tone: "mint" },
  PREGNANCY_CLOSED: { icon: PregnancyIcon, tone: "blush" },
  PASSWORD_RESET: { icon: LockIcon, tone: "cream" },
  NEW_REQUEST: { icon: AppointmentIcon, tone: "mint" },
  MOTHER_CANCELLED: { icon: ClosedDayIcon, tone: "cream" },
  NEW_TIME_ACCEPTED: { icon: CheckCircleIcon, tone: "mint" },
  NEW_TIME_DECLINED: { icon: ClosedDayIcon, tone: "cream" },
  MOTHER_SIGNED_UP: { icon: UserPlusIcon, tone: "mint" },
  MISSED_SUMMARY: { icon: CallIcon, tone: "blush" },
  SMS_FAILED: { icon: SmsIcon, tone: "blush" },
  SMS_PHONE_OFFLINE: { icon: PhoneIcon, tone: "blush" },
  SMS_LIMIT_REACHED: { icon: SmsIcon, tone: "blush" },
  ACCOUNT_LOCKED: { icon: LockIcon, tone: "blush" },
  STAFF_ACCOUNT_CREATED: { icon: UserPlusIcon, tone: "mint" },
  ACCOUNT_DEACTIVATED: { icon: AccountsIcon, tone: "cream" },
  ACCOUNT_REACTIVATED: { icon: AccountsIcon, tone: "mint" },
};

/** The page a notification opens, for the person reading it. */
export function notificationHref(item: NotificationItem, forMother: boolean): string {
  const account = item.details.target_user_id ? `/admin/accounts/${item.details.target_user_id}` : "/admin/accounts";
  switch (item.type) {
    case "CHECKUP_RECORDED":
      return item.visitId ? `/mother/visits/${item.visitId}` : "/mother/visits";
    case "PREGNANCY_CLOSED":
      return "/mother/visits";
    case "PASSWORD_RESET":
      return forMother ? "/mother/profile" : "/staff/profile";
    case "NEW_REQUEST":
      return "/staff/appointments?status=REQUESTED";
    case "NEW_TIME_ACCEPTED":
      return "/staff/appointments?status=upcoming";
    case "MOTHER_CANCELLED":
    case "NEW_TIME_DECLINED":
      return "/staff/appointments?status=CANCELLED";
    case "MOTHER_SIGNED_UP":
      return item.motherId ? `/staff/mothers/${item.motherId}` : "/staff/mothers";
    case "MISSED_SUMMARY":
      return "/staff/follow-ups";
    case "SMS_FAILED":
      return "/admin/sms?status=failed";
    case "SMS_PHONE_OFFLINE":
    case "SMS_LIMIT_REACHED":
      return "/admin/sms";
    case "ACCOUNT_LOCKED":
    case "STAFF_ACCOUNT_CREATED":
    case "ACCOUNT_DEACTIVATED":
    case "ACCOUNT_REACTIVATED":
      return account;
    default:
      // Her visits: requests, answers, bookings, changes, reminders, missed.
      return "/mother/appointments";
  }
}
