import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyNews, type TextNews } from "./save-result";

// One HTTPSMS webhook event (a CloudEvent: { type, data }). Updates the text
// it is about, or the SMS phone's online / offline status. Events for texts we
// don't know, for another phone, or of other types are ignored.
// Uses the admin client: HTTPSMS has no login.

type EventData = {
  id?: unknown;
  message_id?: unknown;
  owner?: unknown;
  timestamp?: unknown;
  error_message?: unknown;
  is_final?: unknown;
};

export async function handleHttpsmsEvent(type: string, data: EventData, ourNumber: string): Promise<"done" | "ignored"> {
  if (typeof data.owner === "string" && data.owner !== ourNumber) return "ignored";
  const at = typeof data.timestamp === "string" ? data.timestamp : null;
  const admin = createAdminClient();

  if (type === "phone.heartbeat.online" || type === "phone.heartbeat.offline") {
    const statusAt = at ?? new Date().toISOString();
    // Only newer news (a late call must not undo a newer status).
    const { data: updated } = await admin
      .from("sms_setting")
      .update({ phone_online: type === "phone.heartbeat.online", phone_status_at: statusAt })
      .eq("setting_id", 1)
      .or(`phone_status_at.is.null,phone_status_at.lt."${statusAt}"`)
      .select("setting_id");
    return updated?.length ? "done" : "ignored";
  }

  let messageId: unknown;
  let news: TextNews;
  if (type === "message.phone.sent") {
    messageId = data.id;
    news = { kind: "sent", at };
  } else if (type === "message.phone.delivered") {
    messageId = data.id;
    news = { kind: "delivered", at };
  } else if (type === "message.send.failed") {
    messageId = data.id;
    news = { kind: "failed", reason: "send_failed", detail: typeof data.error_message === "string" ? data.error_message.slice(0, 300) : null };
  } else if (type === "message.send.expired") {
    // HTTPSMS tries an expired text again itself; only the final expiry counts.
    if (data.is_final !== true) return "ignored";
    messageId = data.message_id;
    news = { kind: "failed", reason: "phone_offline", detail: "expired" };
  } else {
    return "ignored";
  }
  if (typeof messageId !== "string" || !messageId) return "ignored";

  const { data: row } = await admin
    .from("sms_reminder")
    .select("reminder_id, attempt_count, sent_at")
    .eq("provider_message_id", messageId)
    .eq("delivery_status", "SENT")
    .maybeSingle();
  if (!row) return "ignored";
  await applyNews(admin, row, news);
  return "done";
}
