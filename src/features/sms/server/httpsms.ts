import "server-only";

// HTTPSMS API calls (plain fetch). Reads HTTPSMS_API_KEY and HTTPSMS_FROM_NUMBER.
// Docs: https://docs.httpsms.com — send is POST /v1/messages/send, a text's
// status is GET /v1/messages/{id}.

const API = "https://api.httpsms.com/v1";
const TIMEOUT_MS = 15_000;

export type HttpsmsConfig = { apiKey: string; from: string };

/** Null when either value is missing from the environment. */
export function httpsmsConfig(): HttpsmsConfig | null {
  const apiKey = process.env.HTTPSMS_API_KEY;
  const from = process.env.HTTPSMS_FROM_NUMBER;
  return apiKey && from ? { apiKey, from } : null;
}

export type SendResult =
  | { ok: true; id: string }
  // limit: the monthly plan limit is reached (402). auth: the API key was
  // refused. rejected: HTTPSMS refused this text (e.g. the number); not worth
  // retrying. unavailable: network, timeout or server trouble; worth retrying.
  | { ok: false; kind: "limit" | "auth" | "rejected" | "unavailable"; detail: string };

export async function sendSms(config: HttpsmsConfig, to: string, content: string, requestId?: string): Promise<SendResult> {
  let response: Response;
  try {
    response = await fetch(`${API}/messages/send`, {
      method: "POST",
      headers: { "x-api-key": config.apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ from: config.from, to, content, ...(requestId ? { request_id: requestId } : {}) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    return { ok: false, kind: "unavailable", detail: error instanceof Error ? error.message : "network error" };
  }

  const body = (await response.json().catch(() => null)) as { message?: string; data?: { id?: string } } | null;
  const detail = `${response.status} ${body?.message ?? response.statusText}`.slice(0, 300);
  if (response.ok && body?.data?.id) return { ok: true, id: body.data.id };
  if (response.status === 402) return { ok: false, kind: "limit", detail };
  if (response.status === 401 || response.status === 403) return { ok: false, kind: "auth", detail };
  if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
    return { ok: false, kind: "rejected", detail };
  }
  return { ok: false, kind: "unavailable", detail };
}

export type MessageStatus = {
  /** pending, scheduled, sending, sent, delivered, failed, expired (or another HTTPSMS value). */
  status: string;
  failureReason: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
};

/** A text's status at HTTPSMS, or null when it can't be read right now. */
export async function getMessageStatus(config: HttpsmsConfig, id: string): Promise<MessageStatus | null> {
  try {
    const response = await fetch(`${API}/messages/${encodeURIComponent(id)}`, {
      headers: { "x-api-key": config.apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      data?: { status?: string; failure_reason?: string | null; sent_at?: string | null; delivered_at?: string | null };
    };
    if (!body.data?.status) return null;
    return {
      status: body.data.status,
      failureReason: body.data.failure_reason ?? null,
      sentAt: body.data.sent_at ?? null,
      deliveredAt: body.data.delivered_at ?? null,
    };
  } catch {
    return null;
  }
}
