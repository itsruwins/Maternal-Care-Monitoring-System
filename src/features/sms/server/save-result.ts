import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { SmsReminderRow } from "@/types/database";
import type { SmsStatusReason } from "../types";

// Saving what happened to a text, shared by the sender run and the HTTPSMS
// webhook. Every update is matched on the state it expects, so a run and a
// webhook arriving together can't overwrite each other's result.

export type Admin = ReturnType<typeof createAdminClient>;
type Update = Partial<SmsReminderRow>;

const MAX_TRIES = 3; // the first try + 2 automatic retries
const RETRY_AFTER_MS = 30 * 60_000;

// A result is saved: the lock and any planned retry are cleared.
export async function finish(admin: Admin, match: Update, fields: Update) {
  await admin.from("sms_reminder").update({ ...fields, claimed_at: null, next_attempt_at: null }).match(match);
}

// Tried again in 30 minutes while tries are left, else Failed for good.
export async function retryOrFail(
  admin: Admin,
  row: Pick<SmsReminderRow, "attempt_count">,
  match: Update,
  reason: SmsStatusReason,
  detail: string | null,
): Promise<"retrying" | "failed"> {
  if (row.attempt_count < MAX_TRIES) {
    await admin
      .from("sms_reminder")
      .update({
        delivery_status: "PENDING",
        next_attempt_at: new Date(Date.now() + RETRY_AFTER_MS).toISOString(),
        claimed_at: null,
        status_reason: reason,
        error_message: detail,
      })
      .match(match);
    return "retrying";
  }
  await finish(admin, match, { delivery_status: "FAILED", status_reason: reason, error_message: detail });
  return "failed";
}

/** News from HTTPSMS about a text it took (from a status check or the webhook). */
export type TextNews =
  | { kind: "sent"; at: string | null }
  | { kind: "delivered"; at: string | null }
  | { kind: "failed"; reason: "send_failed" | "phone_offline"; detail: string | null };

/** Applies the news to a Sent text; nothing changes if it isn't Sent anymore. */
export async function applyNews(
  admin: Admin,
  row: Pick<SmsReminderRow, "reminder_id" | "attempt_count" | "sent_at">,
  news: TextNews,
): Promise<"delivered" | "retrying" | "failed" | "updated"> {
  const now = new Date().toISOString();
  const stillSent = { reminder_id: row.reminder_id, delivery_status: "SENT" as const };
  if (news.kind === "delivered") {
    await admin
      .from("sms_reminder")
      .update({ delivery_status: "DELIVERED", delivered_at: news.at ?? now, status_checked_at: now })
      .match(stillSent);
    return "delivered";
  }
  if (news.kind === "failed") return retryOrFail(admin, row, stillSent, news.reason, news.detail);
  await admin
    .from("sms_reminder")
    .update({ sent_at: news.at ?? row.sent_at, status_checked_at: now })
    .match(stillSent);
  return "updated";
}
