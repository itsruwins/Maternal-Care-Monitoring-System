import { handleHttpsmsEvent } from "@/features/sms/server/handle-webhook";
import { httpsmsConfig } from "@/features/sms/server/httpsms";
import { validWebhookToken } from "@/features/sms/server/webhook-token";

// HTTPSMS delivery updates and phone heartbeats (HTTPSMS → Settings →
// Webhooks). Every call must carry a token signed with
// HTTPSMS_WEBHOOK_SIGNING_KEY; anything else gets 401. Events it doesn't use
// still get 200, so HTTPSMS doesn't count them as failed.

export async function POST(request: Request) {
  const key = process.env.HTTPSMS_WEBHOOK_SIGNING_KEY;
  const config = httpsmsConfig();
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!key || !config || !token || !validWebhookToken(token, key)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const event = (await request.json().catch(() => null)) as { type?: unknown; data?: unknown } | null;
  const type = typeof event?.type === "string" ? event.type : (request.headers.get("x-event-type") ?? "");
  if (!event || typeof event.data !== "object" || event.data === null) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  return Response.json({ result: await handleHttpsmsEvent(type, event.data, config.from) });
}
