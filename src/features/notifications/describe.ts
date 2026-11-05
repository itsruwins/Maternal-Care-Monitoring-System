import type en from "@/i18n/dictionaries/en.json";
import { format } from "@/i18n/format";
import { formatMonthDay, formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import type { UserRole } from "@/types/database";
import type { NotificationItem } from "./types";

// The words for one notification, in the reader's language, from what was
// saved when it happened. Pure: the bell (client) and the tests use it.

type Texts = (typeof en)["notifications"];
type RoleNames = (typeof en)["shell"]["roles"];

const NBSP = " ";

/** The Manila date of a timestamp, "YYYY-MM-DD". */
export const manilaDay = (iso: string) => new Date(new Date(iso).getTime() + 8 * 3_600_000).toISOString().slice(0, 10);

/** "Thu, Nov 6, 9:00 AM", the date kept whole (it may break only after the comma before the time). */
function when(iso: string, locale: string): string {
  return `${formatSlotDate(iso, locale, "short").replace(/\s+/g, NBSP)}, ${formatSlotClock(iso, locale)}`;
}

/** "Thu, Nov 5", kept whole. */
const dateOnly = (iso: string, locale: string) => formatSlotDate(iso, locale, "short").replace(/\s+/g, NBSP);

export function describeNotification(
  item: NotificationItem,
  t: Texts,
  roles: RoleNames,
  locale: string,
  readerRole: UserRole,
): { title: string; detail: string } {
  const d = item.details;
  const values: Record<string, string | number> = {
    service: d.service ?? "",
    mother: d.mother_name ?? "",
    username: d.username ?? "",
    role: d.role ? roles[d.role] : "",
    count: d.count ?? 1,
    when: d.at ? (item.type === "CHECKUP_RECORDED" ? dateOnly(d.at, locale) : when(d.at, locale)) : "",
  };
  const texts = t.items[item.type] as { title: string; detail: string; titleOne?: string; titleVisit?: string; detailStaff?: string };

  let title = texts.title;
  if (texts.titleOne && (d.count ?? 1) === 1) title = texts.titleOne;
  if (item.type === "MOTHER_CANCELLED" && d.was && d.was !== "REQUESTED" && texts.titleVisit) title = texts.titleVisit;

  const detail = item.type === "PASSWORD_RESET" && readerRole !== "MOTHER" && texts.detailStaff ? texts.detailStaff : texts.detail;
  return { title: format(title, values), detail: format(detail, values) };
}

/** "Just now", "12 min ago", "Today, 9:41 AM", "Yesterday, 4:05 PM", then "Nov 3". */
export function notificationTime(createdAt: string, now: Date, t: Texts, locale: string): string {
  const at = new Date(createdAt);
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000);
  if (minutes < 1) return t.time.justNow;
  if (minutes < 60) return format(t.time.minutes, { count: minutes });
  const day = manilaDay(createdAt);
  const today = manilaDay(now.toISOString());
  if (day === today) return format(t.time.today, { time: formatSlotClock(createdAt, locale) });
  const yesterday = manilaDay(new Date(now.getTime() - 86_400_000).toISOString());
  if (day === yesterday) return format(t.time.yesterday, { time: formatSlotClock(createdAt, locale) });
  return formatMonthDay(createdAt, locale).replace(/\s+/g, NBSP);
}

/** Today's (Manila) and the rest, each newest first as given. */
export function groupByDay(items: NotificationItem[], now: Date): { today: NotificationItem[]; earlier: NotificationItem[] } {
  const today = manilaDay(now.toISOString());
  return {
    today: items.filter((item) => manilaDay(item.createdAt) === today),
    earlier: items.filter((item) => manilaDay(item.createdAt) !== today),
  };
}

/** The bell's count: "9+" above 9. */
export const badgeText = (unread: number) => (unread > 9 ? "9+" : String(unread));
