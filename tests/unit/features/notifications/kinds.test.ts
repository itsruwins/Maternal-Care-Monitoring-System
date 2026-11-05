import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NOTIFICATION_KINDS, notificationHref } from "@/features/notifications/kinds";
import { NOTIFICATION_TYPES, type NotificationDetails, type NotificationItem, type NotificationType } from "@/features/notifications/types";

// Each kind's icon, colour and the page it opens (Phase 10 step 4).

const FOR_HER: NotificationType[] = [
  "REQUEST_CONFIRMED", "REQUEST_NEW_TIME", "REQUEST_DECLINED", "VISIT_BOOKED", "VISIT_REBOOKED", "VISIT_MOVED",
  "VISIT_CANCELLED", "VISIT_REMINDER", "VISIT_MISSED", "CHECKUP_RECORDED", "PREGNANCY_CLOSED",
];
const FOR_STAFF: NotificationType[] = ["NEW_REQUEST", "MOTHER_CANCELLED", "NEW_TIME_ACCEPTED", "NEW_TIME_DECLINED", "MOTHER_SIGNED_UP", "MISSED_SUMMARY"];
const FOR_ADMINS: NotificationType[] = [
  "SMS_FAILED", "SMS_PHONE_OFFLINE", "SMS_LIMIT_REACHED", "ACCOUNT_LOCKED", "STAFF_ACCOUNT_CREATED", "ACCOUNT_DEACTIVATED", "ACCOUNT_REACTIVATED",
];

function item(type: NotificationType, extra: Partial<NotificationItem> = {}, details: NotificationDetails = {}): NotificationItem {
  return { id: 1, type, createdAt: "2026-11-05T02:00:00Z", read: false, details, appointmentId: 7, motherId: 3, visitId: 9, ...extra };
}

describe("NOTIFICATION_TYPES", () => {
  it("matches the database's list (migration 0026), in order", () => {
    const sql = readFileSync("supabase/migrations/0026_notifications.sql", "utf8");
    const list = sql.match(/create type public\.notification_type as enum \(([\s\S]*?)\);/)?.[1] ?? "";
    expect([...list.matchAll(/'([A-Z_]+)'/g)].map((m) => m[1])).toEqual([...NOTIFICATION_TYPES]);
  });

  it("is split into hers, staff and admins with nothing missed (plus the password reset, for anyone)", () => {
    expect([...FOR_HER, "PASSWORD_RESET", ...FOR_STAFF, ...FOR_ADMINS].sort()).toEqual([...NOTIFICATION_TYPES].sort());
  });
});

describe("NOTIFICATION_KINDS", () => {
  it("gives every kind an icon and a colour", () => {
    for (const type of NOTIFICATION_TYPES) {
      expect(NOTIFICATION_KINDS[type]?.icon, type).toBeTruthy();
      expect(["mint", "beige", "cream", "blush"], type).toContain(NOTIFICATION_KINDS[type]?.tone);
    }
  });

  it("never uses the warning sign or the Closed days calendar", async () => {
    const icons = await import("@/components/icons");
    for (const type of NOTIFICATION_TYPES) {
      expect(NOTIFICATION_KINDS[type].icon, type).not.toBe(icons.DangerIcon);
      expect(NOTIFICATION_KINDS[type].icon, type).not.toBe(icons.ClosedDayIcon);
    }
    expect(NOTIFICATION_KINDS.VISIT_MISSED.icon).toBe(icons.HeartIcon);
  });

  it("keeps blush for what needs someone", () => {
    const blush = NOTIFICATION_TYPES.filter((type) => NOTIFICATION_KINDS[type].tone === "blush").sort();
    expect(blush).toEqual(
      [
        "REQUEST_NEW_TIME", "VISIT_MISSED", "NEW_REQUEST", "MISSED_SUMMARY",
        "SMS_FAILED", "SMS_PHONE_OFFLINE", "SMS_LIMIT_REACHED", "ACCOUNT_LOCKED",
      ].sort(),
    );
  });
});

describe("notificationHref", () => {
  it("sends her to her own pages", () => {
    for (const type of FOR_HER) expect(notificationHref(item(type), true), type).toMatch(/^\/mother\//);
    expect(notificationHref(item("VISIT_REMINDER"), true)).toBe("/mother/appointments");
    expect(notificationHref(item("REQUEST_NEW_TIME"), true)).toBe("/mother/appointments");
    expect(notificationHref(item("CHECKUP_RECORDED"), true)).toBe("/mother/visits/9");
    expect(notificationHref(item("CHECKUP_RECORDED", { visitId: null }), true)).toBe("/mother/visits");
    expect(notificationHref(item("PREGNANCY_CLOSED"), true)).toBe("/mother/visits");
  });

  it("sends staff to staff pages, and admin notices to admin pages", () => {
    for (const type of FOR_STAFF) expect(notificationHref(item(type), false), type).toMatch(/^\/staff\//);
    for (const type of FOR_ADMINS) expect(notificationHref(item(type), false), type).toMatch(/^\/admin\//);
  });

  it("opens the right list or record", () => {
    expect(notificationHref(item("NEW_REQUEST"), false)).toBe("/staff/appointments?status=REQUESTED");
    expect(notificationHref(item("NEW_TIME_ACCEPTED"), false)).toBe("/staff/appointments?status=upcoming");
    expect(notificationHref(item("MOTHER_CANCELLED"), false)).toBe("/staff/appointments?status=CANCELLED");
    expect(notificationHref(item("NEW_TIME_DECLINED"), false)).toBe("/staff/appointments?status=CANCELLED");
    expect(notificationHref(item("MOTHER_SIGNED_UP"), false)).toBe("/staff/mothers/3");
    expect(notificationHref(item("MOTHER_SIGNED_UP", { motherId: null }), false)).toBe("/staff/mothers");
    expect(notificationHref(item("MISSED_SUMMARY"), false)).toBe("/staff/follow-ups");
    expect(notificationHref(item("SMS_FAILED"), false)).toBe("/admin/sms?status=failed");
    expect(notificationHref(item("SMS_PHONE_OFFLINE"), false)).toBe("/admin/sms");
    expect(notificationHref(item("SMS_LIMIT_REACHED"), false)).toBe("/admin/sms");
  });

  it("opens the account it is about, or the accounts list", () => {
    const target = { target_user_id: "00000000-0000-0000-0000-000000000001" };
    for (const type of ["ACCOUNT_LOCKED", "STAFF_ACCOUNT_CREATED", "ACCOUNT_DEACTIVATED", "ACCOUNT_REACTIVATED"] as const) {
      expect(notificationHref(item(type, {}, target), false), type).toBe(`/admin/accounts/${target.target_user_id}`);
      expect(notificationHref(item(type), false), type).toBe("/admin/accounts");
    }
  });

  it("opens the reader's own profile after a password reset", () => {
    expect(notificationHref(item("PASSWORD_RESET"), true)).toBe("/mother/profile");
    expect(notificationHref(item("PASSWORD_RESET"), false)).toBe("/staff/profile");
  });
});
