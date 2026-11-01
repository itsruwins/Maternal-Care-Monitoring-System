import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDays } from "@/lib/utils/pregnancy";
import type { ReminderType, SmsDeliveryStatus, SmsLogItemRow } from "@/types/database";
import type { SmsCounts, SmsLogFilters, SmsLogItem, SmsLogStatus, SmsLogType, SmsStatusReason } from "../types";

export const SMS_LOG_PAGE_SIZE = 20;

const ITEM_FIELDS =
  "reminder_id, reminder_type, delivery_status, status_reason, recipient_number, sent_to, message_text, shown_at, next_attempt_at, service, visit_at, mother_id, first_name, middle_name, last_name";
type ItemRow = Pick<
  SmsLogItemRow,
  | "reminder_id"
  | "reminder_type"
  | "delivery_status"
  | "status_reason"
  | "recipient_number"
  | "sent_to"
  | "message_text"
  | "shown_at"
  | "next_attempt_at"
  | "service"
  | "visit_at"
  | "mother_id"
  | "first_name"
  | "middle_name"
  | "last_name"
>;

const STATUSES: Record<SmsLogStatus, SmsDeliveryStatus[]> = {
  waiting: ["PENDING"],
  sent: ["SENT", "DELIVERED"],
  delivered: ["DELIVERED"],
  failed: ["FAILED"],
  skipped: ["SKIPPED"],
};

const TYPES: Record<SmsLogType, ReminderType[]> = {
  reminder: ["UPCOMING"],
  missed: ["MISSED_NOTICE"],
  answer: ["REQUEST_CONFIRMED", "REQUEST_NEW_TIME", "REQUEST_DECLINED"],
};

const dayStart = (date: string) => `${date}T00:00:00+08:00`;

/** Reads ?q=&status=&type=&from=&to=&page= into safe values. */
export function parseSmsLogFilters(params: Record<string, string | string[] | undefined>): SmsLogFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const date = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
  const status = one("status");
  const type = one("type");
  const page = Number.parseInt(one("page"), 10);
  return {
    // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    status: Object.hasOwn(STATUSES, status) ? (status as SmsLogStatus) : "",
    type: Object.hasOwn(TYPES, type) ? (type as SmsLogType) : "",
    from: date(one("from")),
    to: date(one("to")),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// All read as the logged-in staff member (the database lets staff read every text).

/**
 * Texts newest first, 20 per page. Search: every word must match a part of
 * her name, or the number the text goes or went to.
 */
export async function listSmsLog(filters: SmsLogFilters): Promise<{ items: SmsLogItem[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * SMS_LOG_PAGE_SIZE;
  let query = supabase
    .from("sms_log_item")
    .select(ITEM_FIELDS, { count: "exact" })
    .order("shown_at", { ascending: false })
    .order("reminder_id", { ascending: false })
    .range(from, from + SMS_LOG_PAGE_SIZE - 1);

  for (const word of filters.q.split(" ").filter(Boolean)) {
    const like = `%${word}%`;
    query = query.or(
      `first_name.ilike.${like},middle_name.ilike.${like},last_name.ilike.${like},recipient_number.ilike.${like},sent_to.ilike.${like}`,
    );
  }
  if (filters.status) query = query.in("delivery_status", STATUSES[filters.status]);
  if (filters.type) query = query.in("reminder_type", TYPES[filters.type]);
  if (filters.from) query = query.gte("shown_at", dayStart(filters.from));
  if (filters.to) query = query.lt("shown_at", dayStart(addDays(filters.to, 1)!));

  const { data, count, error } = await query;
  if (error || !data) return { items: [], total: 0 };
  return { items: data.map(toItem), total: count ?? 0 };
}

/** Waiting, sent today (Manila) and failed: the counts at the top of the log. */
export async function countSmsLog(today: string): Promise<SmsCounts> {
  const supabase = await createClient();
  const count = (statuses: SmsDeliveryStatus[], sentSince?: string) => {
    let query = supabase.from("sms_reminder").select("reminder_id", { count: "exact", head: true }).in("delivery_status", statuses);
    if (sentSince) query = query.gte("sent_at", sentSince);
    return query;
  };
  const [waiting, sentToday, failed] = await Promise.all([
    count(STATUSES.waiting),
    count(STATUSES.sent, dayStart(today)),
    count(STATUSES.failed),
  ]);
  return { waiting: waiting.count ?? 0, sentToday: sentToday.count ?? 0, failed: failed.count ?? 0 };
}

/** One mother's texts, newest first (her record's SMS log tab). */
export async function listMotherSms(motherId: number): Promise<SmsLogItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sms_log_item")
    .select(ITEM_FIELDS)
    .eq("mother_id", motherId)
    .order("shown_at", { ascending: false })
    .order("reminder_id", { ascending: false });
  return (data ?? []).map(toItem);
}

function toItem(row: ItemRow): SmsLogItem {
  const sentOut = row.delivery_status === "SENT" || row.delivery_status === "DELIVERED";
  return {
    id: row.reminder_id,
    type: row.reminder_type,
    status: row.delivery_status,
    reason: row.status_reason as SmsStatusReason | null,
    number: (sentOut && row.sent_to) || row.recipient_number,
    text: row.message_text,
    at: row.shown_at,
    retrying: row.delivery_status === "PENDING" && row.next_attempt_at !== null,
    service: row.service,
    visitAt: row.visit_at,
    mother: { id: row.mother_id, name: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ") },
  };
}
