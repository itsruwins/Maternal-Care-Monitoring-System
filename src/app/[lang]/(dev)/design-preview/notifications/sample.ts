import type { NotificationDetails, NotificationItem, NotificationType } from "@/features/notifications/types";

// Sample notifications for the design preview. "Now" is Thu 2026-11-05,
// 11:00 AM Manila (03:00 UTC).
export const NOW = "2026-11-05T03:00:00Z";

let nextId = 1;
const item = (type: NotificationType, createdAt: string, details: NotificationDetails, read = false, extra: Partial<NotificationItem> = {}): NotificationItem => ({
  id: nextId++,
  type,
  createdAt,
  read,
  details,
  appointmentId: 1,
  motherId: 1,
  visitId: null,
  ...extra,
});

/** Minutes before "now", as an ISO time. */
const ago = (minutes: number) => new Date(new Date(NOW).getTime() - minutes * 60_000).toISOString();

export const MOTHER_SAMPLE: NotificationItem[] = [
  item("REQUEST_NEW_TIME", ago(5), { service: "Tetanus Toxoid Vaccination", at: "2026-11-06T02:00:00Z" }),
  item("REQUEST_CONFIRMED", ago(62), { service: "Prenatal Checkup", at: "2026-11-09T01:00:00Z" }),
  item("VISIT_REMINDER", "2026-11-05T00:00:00Z", { service: "Nutrition Counseling", at: "2026-11-06T01:30:00Z" }, true),
  item("CHECKUP_RECORDED", "2026-11-04T06:15:00Z", { at: "2026-11-04T06:00:00Z" }, false, { visitId: 12 }),
  item("VISIT_REBOOKED", "2026-11-03T01:10:00Z", { service: "Prenatal Checkup", at: "2026-11-09T01:00:00Z" }, true),
  item("VISIT_MISSED", "2026-11-02T10:00:00Z", { service: "Prenatal Checkup", at: "2026-11-02T01:30:00Z" }, true),
  item("VISIT_MOVED", "2026-10-30T05:20:00Z", { service: "Fetal Heartbeat Check", at: "2026-11-02T01:30:00Z" }, true),
  item("VISIT_BOOKED", "2026-10-28T02:45:00Z", { service: "Fetal Heartbeat Check", at: "2026-10-30T02:00:00Z" }, true),
  item("REQUEST_DECLINED", "2026-10-27T03:05:00Z", { service: "Prenatal Dental Checkup", at: "2026-10-29T06:00:00Z" }, true),
  item("VISIT_CANCELLED", "2026-10-26T07:40:00Z", { service: "Birth Plan Counseling", at: "2026-10-28T05:30:00Z" }, true),
  item("PASSWORD_RESET", "2026-10-20T01:00:00Z", {}, true),
];

/** Every kind for her, for the wording list (one closed pregnancy included). */
export const MOTHER_KINDS: NotificationItem[] = [
  ...MOTHER_SAMPLE,
  item("PREGNANCY_CLOSED", "2026-10-15T02:00:00Z", { status: "DELIVERED" }, true),
];

const STAFF_ITEMS: NotificationItem[] = [
  item("NEW_REQUEST", ago(3), { mother_name: "Ana Reyes", service: "Prenatal Checkup", at: "2026-11-09T01:30:00Z" }),
  item("NEW_TIME_DECLINED", ago(41), { mother_name: "Jennilyn Dugan", service: "Tetanus Toxoid Vaccination", at: "2026-11-06T02:00:00Z", was: "RESCHEDULED" }),
  item("MOTHER_SIGNED_UP", "2026-11-05T01:12:00Z", { mother_name: "Cora Santos" }),
  item("NEW_TIME_ACCEPTED", "2026-11-05T00:40:00Z", { mother_name: "Rosemarie Bautista", service: "Fetal Heartbeat Check", at: "2026-11-10T05:00:00Z", was: "RESCHEDULED" }, true),
  item("MISSED_SUMMARY", "2026-11-04T10:00:00Z", { count: 3, day: "2026-11-04" }),
  item("MOTHER_CANCELLED", "2026-11-04T02:20:00Z", { mother_name: "Liza Mendoza", service: "Prenatal Checkup", at: "2026-11-12T01:00:00Z", was: "CONFIRMED" }, true),
  item("MOTHER_CANCELLED", "2026-11-03T08:05:00Z", { mother_name: "Grace Villanueva", service: "Nutrition Counseling", at: "2026-11-11T06:30:00Z", was: "REQUESTED" }, true),
  item("MISSED_SUMMARY", "2026-11-03T10:00:00Z", { count: 1, day: "2026-11-03" }, true),
  item("NEW_REQUEST", "2026-11-03T03:15:00Z", { mother_name: "Liza Mendoza", service: "Prenatal Checkup", at: "2026-11-12T01:00:00Z" }, true),
];

const ADMIN_ITEMS: NotificationItem[] = [
  item("SMS_FAILED", ago(18), { count: 3 }),
  item("SMS_PHONE_OFFLINE", ago(118), { at: ago(118) }),
  item("ACCOUNT_LOCKED", "2026-11-05T00:25:00Z", { username: "jennilyn.dugan", role: "MOTHER", target_user_id: "00000000-0000-0000-0000-000000000001" }),
  item("STAFF_ACCOUNT_CREATED", "2026-11-04T05:30:00Z", { username: "midwife.reyes", role: "HEALTH_WORKER", target_user_id: "00000000-0000-0000-0000-000000000002" }, true),
  item("ACCOUNT_DEACTIVATED", "2026-11-02T03:00:00Z", { username: "bhw.santos", role: "HEALTH_WORKER", target_user_id: "00000000-0000-0000-0000-000000000003" }, true),
  item("SMS_LIMIT_REACHED", "2026-10-31T09:10:00Z", { at: "2026-10-31T09:10:00Z" }, true),
  item("ACCOUNT_REACTIVATED", "2026-10-30T02:00:00Z", { username: "bhw.santos", role: "HEALTH_WORKER", target_user_id: "00000000-0000-0000-0000-000000000003" }, true),
];

/** Older, read requests so the admin list runs past 20 (for "Show older"). */
const NAMES = ["Maricel Lopez", "Joy Aquino", "Precious Ramos", "April Dela Cruz", "Kristine Flores", "Mylene Garcia", "Roselyn Torres", "Jessa Castillo"];
const SERVICES = ["Prenatal Checkup", "Tetanus Toxoid Vaccination", "Nutrition Counseling", "Fetal Heartbeat Check"];
const OLDER: NotificationItem[] = Array.from({ length: 26 }, (_, n) =>
  item(
    n % 3 === 0 ? "NEW_TIME_ACCEPTED" : "NEW_REQUEST",
    new Date(Date.parse("2026-10-29T02:00:00Z") - n * 19 * 3_600_000).toISOString(),
    { mother_name: NAMES[n % NAMES.length], service: SERVICES[n % SERVICES.length], at: "2026-11-16T01:00:00Z", was: n % 3 === 0 ? "RESCHEDULED" : undefined },
    true,
  ),
);

const byNewest = (list: NotificationItem[]) => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);

export const HEALTH_WORKER_SAMPLE = byNewest(STAFF_ITEMS);
export const ADMIN_SAMPLE = byNewest([...STAFF_ITEMS, ...ADMIN_ITEMS, ...OLDER]);

/** Every kind staff can get (password reset included), for the wording list. */
export const HEALTH_WORKER_KINDS = byNewest([...STAFF_ITEMS, item("PASSWORD_RESET", "2026-10-20T01:00:00Z", {}, true)]);
export const ADMIN_KINDS = byNewest([...STAFF_ITEMS, ...ADMIN_ITEMS, item("PASSWORD_RESET", "2026-10-20T01:00:00Z", {}, true)]);
