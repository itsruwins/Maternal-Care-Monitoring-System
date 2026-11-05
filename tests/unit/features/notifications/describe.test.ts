import { describe, expect, it } from "vitest";
import en from "@/i18n/dictionaries/en.json";
import fil from "@/i18n/dictionaries/fil.json";
import { badgeText, describeNotification, groupByDay, manilaDay, notificationTime } from "@/features/notifications/describe";
import { NOTIFICATION_TYPES, type NotificationDetails, type NotificationItem, type NotificationType } from "@/features/notifications/types";
import type { UserRole } from "@/types/database";

// The words each notification shows (Phase 10 step 4). "Now" is Thu, Nov 5,
// 2026, 11:00 AM in Manila; the visit is Fri, Nov 6, 9:00 AM.

const NBSP = " ";
const NOW = new Date("2026-11-05T03:00:00Z");
const VISIT_AT = "2026-11-06T01:00:00Z";
const DICTS = { en, fil } as const;
type Locale = keyof typeof DICTS;

function item(type: NotificationType, details: NotificationDetails = {}, createdAt = "2026-11-05T02:00:00Z"): NotificationItem {
  return { id: 1, type, createdAt, read: false, details, appointmentId: 7, motherId: 3, visitId: 9 };
}

/** The words, with the no-break spaces shown as plain spaces. */
function words(type: NotificationType, details: NotificationDetails = {}, locale: Locale = "en", reader: UserRole = "MOTHER") {
  const d = DICTS[locale];
  const { title, detail } = describeNotification(item(type, details), d.notifications, d.shell.roles, locale, reader);
  return { title: title.replaceAll(NBSP, " "), detail: detail.replaceAll(NBSP, " "), raw: { title, detail } };
}

const time = (createdAt: string, locale: Locale = "en") =>
  notificationTime(createdAt, NOW, DICTS[locale].notifications, locale).replaceAll(NBSP, " ");

const FULL: NotificationDetails = {
  service: "Prenatal Checkup",
  at: VISIT_AT,
  mother_name: "Ana Reyes",
  was: "CONFIRMED",
  count: 3,
  day: "2026-11-05",
  status: "DELIVERED",
  username: "bhw.cruz",
  role: "HEALTH_WORKER",
  target_user_id: "00000000-0000-0000-0000-000000000001",
};

describe("describeNotification: every kind", () => {
  it("has words in both languages for every reader, with nothing left unfilled", () => {
    for (const locale of ["en", "fil"] as const) {
      for (const reader of ["MOTHER", "HEALTH_WORKER", "ADMIN"] as const) {
        for (const type of NOTIFICATION_TYPES) {
          const { title, detail } = words(type, FULL, locale, reader);
          const label = `${locale} ${reader} ${type}`;
          expect(title.trim(), label).not.toBe("");
          expect(detail.trim(), label).not.toBe("");
          expect(`${title} ${detail}`, label).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });

  it("still reads when a detail is missing (no {placeholder} shows)", () => {
    for (const type of NOTIFICATION_TYPES) {
      const { title, detail } = words(type, {});
      expect(`${title} ${detail}`, type).not.toMatch(/\{\w+\}/);
    }
  });
});

describe("describeNotification: her visits", () => {
  it("names the service and the visit's day and time", () => {
    expect(words("REQUEST_CONFIRMED", FULL)).toMatchObject({
      title: "Your request is confirmed",
      detail: "Prenatal Checkup · Fri, Nov 6, 9:00 AM",
    });
    expect(words("VISIT_MOVED", FULL).detail).toBe("Prenatal Checkup · now Fri, Nov 6, 9:00 AM");
    expect(words("REQUEST_CONFIRMED", FULL, "fil")).toMatchObject({
      title: "Kumpirmado na ang hiling mo",
      detail: "Prenatal Checkup · Biy, Nob 6, 9:00 AM",
    });
  });

  it("keeps the date whole and \"·\" off the start of a line", () => {
    for (const locale of ["en", "fil"] as const) {
      const { detail } = words("VISIT_BOOKED", FULL, locale).raw;
      // A line may break only after "·" and after the comma before the time.
      expect(detail.replace("Prenatal Checkup", "").split(" "), locale).toHaveLength(3);
      expect(detail, locale).toContain(`${NBSP}· `);
      expect(detail, locale).toMatch(new RegExp(`, 9:00${NBSP}AM$`));
    }
  });

  it("shows only the date for a recorded checkup", () => {
    expect(words("CHECKUP_RECORDED", FULL).detail).toBe("Your results from Fri, Nov 6 are ready to see.");
    expect(words("CHECKUP_RECORDED", FULL, "fil").detail).toBe("Puwede mo nang makita ang resulta mo mula Biy, Nob 6.");
  });

  it("never names how a pregnancy ended", () => {
    const delivered = words("PREGNANCY_CLOSED", { ...FULL, status: "DELIVERED" });
    const ended = words("PREGNANCY_CLOSED", { ...FULL, status: "ENDED" });
    expect(delivered).toEqual(ended);
    for (const locale of ["en", "fil"] as const) {
      const { title, detail } = words("PREGNANCY_CLOSED", { ...FULL, status: "ENDED" }, locale);
      expect(`${title} ${detail}`, locale).not.toMatch(/deliver|ended|loss|miscarr|panganak|nakunan/i);
    }
  });

  it("tells a mother and a staff member different things after a password reset", () => {
    expect(words("PASSWORD_RESET", {}, "en", "MOTHER").detail).toBe(en.notifications.items.PASSWORD_RESET.detail);
    expect(words("PASSWORD_RESET", {}, "en", "HEALTH_WORKER").detail).toBe(en.notifications.items.PASSWORD_RESET.detailStaff);
    expect(words("PASSWORD_RESET", {}, "en", "ADMIN").detail).toBe(en.notifications.items.PASSWORD_RESET.detailStaff);
    expect(words("PASSWORD_RESET", {}, "fil", "HEALTH_WORKER").detail).toBe(fil.notifications.items.PASSWORD_RESET.detailStaff);
  });
});

describe("describeNotification: staff notices", () => {
  it("names the mother", () => {
    expect(words("NEW_REQUEST", FULL, "en", "HEALTH_WORKER").title).toBe("New request from Ana Reyes");
    expect(words("NEW_TIME_DECLINED", FULL, "en", "ADMIN").title).toBe("Ana Reyes declined the new time");
  });

  it("says whether she cancelled a request or a visit", () => {
    expect(words("MOTHER_CANCELLED", { ...FULL, was: "REQUESTED" }, "en", "HEALTH_WORKER").title).toBe("Ana Reyes cancelled her request");
    expect(words("MOTHER_CANCELLED", { ...FULL, was: "CONFIRMED" }, "en", "HEALTH_WORKER").title).toBe("Ana Reyes cancelled her visit");
    expect(words("MOTHER_CANCELLED", { ...FULL, was: "RESCHEDULED" }, "en", "HEALTH_WORKER").title).toBe("Ana Reyes cancelled her visit");
    expect(words("MOTHER_CANCELLED", { ...FULL, was: undefined }, "en", "HEALTH_WORKER").title).toBe("Ana Reyes cancelled her request");
    expect(words("MOTHER_CANCELLED", { ...FULL, was: "CONFIRMED" }, "fil", "HEALTH_WORKER").title).toBe("Kinansela ni Ana Reyes ang bisita niya");
  });

  it("counts up, with its own words for exactly one", () => {
    expect(words("MISSED_SUMMARY", { count: 1 }, "en", "HEALTH_WORKER").title).toBe("1 visit marked missed");
    expect(words("MISSED_SUMMARY", {}, "en", "HEALTH_WORKER").title).toBe("1 visit marked missed");
    expect(words("MISSED_SUMMARY", { count: 4 }, "en", "HEALTH_WORKER").title).toBe("4 visits marked missed");
    expect(words("SMS_FAILED", { count: 1 }, "en", "ADMIN").title).toBe("1 text failed");
    expect(words("SMS_FAILED", { count: 12 }, "en", "ADMIN").title).toBe("12 texts failed");
    expect(words("SMS_FAILED", { count: 12 }, "fil", "ADMIN").title).toContain("12");
    expect(words("SMS_FAILED", { count: 1 }, "fil", "ADMIN").title).toBe(fil.notifications.items.SMS_FAILED.titleOne);
  });

  it("names the account and its role in the reader's language", () => {
    expect(words("ACCOUNT_LOCKED", FULL, "en", "ADMIN").title).toBe("@bhw.cruz is locked");
    expect(words("STAFF_ACCOUNT_CREATED", { ...FULL, role: "ADMIN" }, "en", "ADMIN")).toMatchObject({
      title: "New staff account: @bhw.cruz",
      detail: "Admin · added by another admin",
    });
    expect(words("ACCOUNT_DEACTIVATED", { ...FULL, role: "MOTHER" }, "fil", "ADMIN").detail).toMatch(/^Nanay · /);
  });
});

describe("the Filipino words", () => {
  it("say \"nanay\", never \"ina\"", () => {
    const all = JSON.stringify(fil.notifications);
    expect(all).not.toMatch(/\bina\b/i);
  });

  it("have the same pieces as the English ones", () => {
    const keys = (value: unknown, prefix = ""): string[] =>
      value && typeof value === "object"
        ? Object.entries(value).flatMap(([key, inner]) => keys(inner, `${prefix}${key}.`))
        : [prefix.slice(0, -1)];
    expect(keys(fil.notifications).sort()).toEqual(keys(en.notifications).sort());
  });

  it("keep the same {placeholders} as the English ones", () => {
    const holes = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const walk = (a: unknown, b: unknown, path: string) => {
      if (typeof a === "string") {
        expect(holes(b as string), path).toEqual(holes(a));
        return;
      }
      for (const key of Object.keys(a as object)) walk((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`);
    };
    walk(en.notifications, fil.notifications, "notifications");
  });

  it("have words for every kind and nothing else", () => {
    expect(Object.keys(en.notifications.items).sort()).toEqual([...NOTIFICATION_TYPES].sort());
    expect(Object.keys(fil.notifications.items).sort()).toEqual([...NOTIFICATION_TYPES].sort());
  });
});

describe("notificationTime", () => {
  it("says \"Just now\" under a minute, then minutes for the first hour", () => {
    expect(time("2026-11-05T02:59:30Z")).toBe("Just now");
    expect(time("2026-11-05T02:59:01Z")).toBe("Just now");
    expect(time("2026-11-05T02:59:00Z")).toBe("1 min ago");
    expect(time("2026-11-05T02:01:00Z")).toBe("59 min ago");
    expect(time("2026-11-05T02:58:00Z", "fil")).toBe("2 min na ang nakalipas");
    expect(time("2026-11-05T02:59:30Z", "fil")).toBe("Ngayon lang");
  });

  it("gives just the time today (under the Today heading) and \"Yesterday\" before it, by the Manila day", () => {
    expect(time("2026-11-05T02:00:00Z")).toBe("10:00 AM");
    expect(time("2026-11-04T16:00:00Z")).toBe("12:00 AM"); // just after midnight in Manila
    expect(time("2026-11-04T15:59:00Z")).toBe("Yesterday, 11:59 PM");
    expect(time("2026-11-03T16:00:00Z")).toBe("Yesterday, 12:00 AM");
    expect(time("2026-11-05T02:00:00Z", "fil")).toBe("10:00 AM");
    expect(time("2026-11-04T15:59:00Z", "fil")).toBe("Kahapon, 11:59 PM");
  });

  it("gives only the date before yesterday, kept whole", () => {
    expect(time("2026-11-03T15:59:00Z")).toBe("Nov 3");
    expect(time("2026-10-28T01:00:00Z")).toBe("Oct 28");
    expect(time("2026-11-03T01:00:00Z", "fil")).toBe("Nob 3");
    expect(notificationTime("2026-11-03T01:00:00Z", NOW, en.notifications, "en")).toBe(`Nov${NBSP}3`);
  });

  it("treats a clock slightly ahead of the server as just now", () => {
    expect(time("2026-11-05T03:00:20Z")).toBe("Just now");
  });
});

describe("manilaDay and groupByDay", () => {
  it("uses the Manila date (UTC+8)", () => {
    expect(manilaDay("2026-11-04T15:59:59Z")).toBe("2026-11-04");
    expect(manilaDay("2026-11-04T16:00:00Z")).toBe("2026-11-05");
    expect(manilaDay("2026-11-05T15:59:59.999Z")).toBe("2026-11-05");
  });

  it("puts today's under Today and the rest under Earlier, in the order given", () => {
    const list = [
      item("NEW_REQUEST", {}, "2026-11-05T02:50:00Z"),
      item("VISIT_BOOKED", {}, "2026-11-04T16:00:00Z"),
      item("VISIT_MOVED", {}, "2026-11-04T15:59:00Z"),
      item("SMS_FAILED", {}, "2026-10-30T01:00:00Z"),
    ].map((each, i) => ({ ...each, id: i + 1 }));
    const { today, earlier } = groupByDay(list, NOW);
    expect(today.map((each) => each.id)).toEqual([1, 2]);
    expect(earlier.map((each) => each.id)).toEqual([3, 4]);
    expect(groupByDay([], NOW)).toEqual({ today: [], earlier: [] });
  });
});

describe("badgeText", () => {
  it("shows the count up to 9, then \"9+\"", () => {
    expect(badgeText(1)).toBe("1");
    expect(badgeText(9)).toBe("9");
    expect(badgeText(10)).toBe("9+");
    expect(badgeText(250)).toBe("9+");
  });
});
