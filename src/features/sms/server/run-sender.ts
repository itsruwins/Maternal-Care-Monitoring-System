import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SmsReminderRow } from "@/types/database";
import { checkSmsText, toInternational } from "../text-rules";
import type { RunSummary } from "../types";
import { getMessageStatus, httpsmsConfig, sendSms, type HttpsmsConfig } from "./httpsms";
import { applyNews, finish, retryOrFail, type Admin, type TextNews } from "./save-result";

// One sender run, used by the schedule (/api/cron/send-sms), by Send now, and
// right after a staff answer or visit change (sendSoon, without step 3):
// 1. Take the due texts (claim_due_sms: at most 20, too-late ones Skipped),
//    each to her number.
// 2. Sent with HTTPSMS's message id, or Failed with the reason. Network or
//    HTTPSMS trouble is tried again 30 minutes later, 3 tries in all. A text
//    HTTPSMS refuses, a bad number, or a text that breaks the text rules is
//    not retried. The monthly limit or a refused API key stops the run; the
//    texts not sent yet keep waiting (that try isn't counted).
// 3. Ask HTTPSMS about Sent texts from the last day with no news yet. An
//    expired text that HTTPSMS will try again itself is left alone; only its
//    final attempt counts as failed (else she could get the text twice).
// Uses the admin client: the sender has no login.

const CHECK_WINDOW_MS = 24 * 60 * 60_000;
const CHECKS_PER_RUN = 20;


export async function runSender({ checkStatus = true }: { checkStatus?: boolean } = {}): Promise<RunSummary> {
  const summary: RunSummary = { sent: 0, retrying: 0, failed: 0, checked: 0, delivered: 0, stopped: null };
  const config = httpsmsConfig();
  if (!config) return { ...summary, stopped: "config" };

  const admin = createAdminClient();
  const { data: setting, error: settingError } = await admin
    .from("sms_setting")
    .select("limit_reached_at")
    .eq("setting_id", 1)
    .maybeSingle();
  if (settingError) return { ...summary, stopped: "error" };

  const { data: due, error: claimError } = await admin.rpc("claim_due_sms");
  if (claimError) return { ...summary, stopped: "error" };

  let limitCleared = !setting?.limit_reached_at;
  for (const row of due ?? []) {
    // Only while this run still holds the text (claimed_at unchanged).
    const mine = { reminder_id: row.reminder_id, claimed_at: row.claimed_at };
    if (summary.stopped) {
      await release(admin, row);
      continue;
    }

    const check = checkSmsText(row.message_text);
    const number = toInternational(row.recipient_number);
    if (!check.ok || !number) {
      await finish(admin, mine, { delivery_status: "FAILED", status_reason: check.ok ? "bad_number" : check.reason });
      summary.failed++;
      continue;
    }

    const result = await sendSms(config, number, row.message_text, `sms-${row.reminder_id}-${row.attempt_count}`);
    if (result.ok) {
      await finish(admin, mine, {
        delivery_status: "SENT",
        provider_message_id: result.id,
        sent_to: row.recipient_number,
        sent_at: new Date().toISOString(),
        delivered_at: null,
        status_checked_at: null,
        status_reason: null,
        error_message: null,
      });
      summary.sent++;
      if (!limitCleared) {
        await admin.from("sms_setting").update({ limit_reached_at: null }).eq("setting_id", 1);
        limitCleared = true;
      }
    } else if (result.kind === "limit" || result.kind === "auth") {
      summary.stopped = result.kind;
      await release(admin, row);
      if (result.kind === "limit") {
        await admin.from("sms_setting").update({ limit_reached_at: new Date().toISOString() }).eq("setting_id", 1);
      }
    } else if (result.kind === "rejected") {
      await finish(admin, mine, { delivery_status: "FAILED", status_reason: "rejected", error_message: result.detail });
      summary.failed++;
    } else {
      summary[await retryOrFail(admin, row, mine, "send_error", result.detail)]++;
    }
  }

  if (checkStatus && summary.stopped !== "auth") await checkSentTexts(admin, config, summary);
  return summary;
}

// Not sent by this run after all: back in the queue, the try not counted.
async function release(admin: Admin, row: SmsReminderRow) {
  await admin
    .from("sms_reminder")
    .update({ claimed_at: null, attempt_count: Math.max(row.attempt_count - 1, 0) })
    .match({ reminder_id: row.reminder_id, claimed_at: row.claimed_at });
}

// Sent texts from the last day with no news yet, least recently asked first.
async function checkSentTexts(admin: Admin, config: HttpsmsConfig, summary: RunSummary) {
  const { data: rows } = await admin
    .from("sms_reminder")
    .select("reminder_id, provider_message_id, attempt_count, sent_at")
    .eq("delivery_status", "SENT")
    .not("provider_message_id", "is", null)
    .gte("sent_at", new Date(Date.now() - CHECK_WINDOW_MS).toISOString())
    .order("status_checked_at", { ascending: true, nullsFirst: true })
    .limit(CHECKS_PER_RUN);

  for (const row of rows ?? []) {
    const status = await getMessageStatus(config, row.provider_message_id!);
    if (!status) continue;
    summary.checked++;
    const finalExpiry = status.status === "expired" && status.sendAttempts >= status.maxSendAttempts;
    const news: TextNews =
      status.status === "delivered"
        ? { kind: "delivered", at: status.deliveredAt }
        : status.status === "failed" || finalExpiry
          ? { kind: "failed", reason: finalExpiry ? "phone_offline" : "send_failed", detail: status.failureReason }
          : { kind: "sent", at: status.sentAt };
    const outcome = await applyNews(admin, row, news);
    if (outcome !== "updated") summary[outcome]++;
  }
}
