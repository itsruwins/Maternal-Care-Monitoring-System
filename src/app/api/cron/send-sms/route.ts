import { timingSafeEqual } from "node:crypto";
import { runSender } from "@/features/sms/server/run-sender";

// The SMS sender, called every 5 minutes by Supabase (pg_cron + pg_net, job
// send-sms) with Authorization: Bearer <CRON_SECRET>. Anything else gets 401.
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !sameText(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json(await runSender());
}

// Compares without leaking how much of the secret matched.
function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
