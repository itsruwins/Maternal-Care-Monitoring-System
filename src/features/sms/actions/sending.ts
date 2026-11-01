"use server";

import { requireRole } from "@/lib/auth/session";
import { runSender } from "../server/run-sender";
import type { RunSummary } from "../types";

// Admin sending controls on /admin/sms.

// Runs the sender now (the same run the schedule makes).
export async function sendNow(): Promise<RunSummary> {
  await requireRole(["ADMIN"]);
  return runSender();
}
