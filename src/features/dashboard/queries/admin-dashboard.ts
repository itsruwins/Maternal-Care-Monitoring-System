import "server-only";
import { SMS_MONTHLY_LIMIT } from "@/config/sms";
import { createClient } from "@/lib/supabase/server";
import type { SmsDeliveryStatus } from "@/types/database";
import type { AdminDashboard } from "../types";

// Admins only: the page checks the role, and the database lets only admins
// read every login and the SMS settings. Read from our own tables only (no
// Supabase Auth calls).

/** Account counts and SMS health. `today` is a Manila date. */
export async function getAdminDashboard(today: string): Promise<AdminDashboard> {
  const supabase = await createClient();
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthStartAt = `${monthStart}T00:00:00+08:00`;

  const accounts = () => supabase.from("user_account").select("user_id", { count: "exact", head: true });
  const mothers = () => supabase.from("mother").select("mother_id", { count: "exact", head: true });
  const texts = (statuses?: SmsDeliveryStatus[]) => {
    const query = supabase.from("sms_reminder").select("reminder_id", { count: "exact", head: true });
    return statuses ? query.in("delivery_status", statuses) : query;
  };
  // Failed and Not sent texts this month, by when they were due or went out
  // (the SMS log's own date).
  const logThisMonth = (status: SmsDeliveryStatus) =>
    supabase
      .from("sms_log_item")
      .select("reminder_id", { count: "exact", head: true })
      .eq("delivery_status", status)
      .gte("shown_at", monthStartAt);

  const [
    healthWorkers,
    admins,
    inactive,
    motherTotal,
    withLogin,
    signedUp,
    setting,
    sent,
    delivered,
    failedMonth,
    skippedMonth,
    waiting,
    failed,
  ] = await Promise.all([
    accounts().eq("role", "HEALTH_WORKER"),
    accounts().eq("role", "ADMIN"),
    accounts().eq("account_status", "INACTIVE"),
    mothers(),
    mothers().not("user_id", "is", null),
    // Website sign-ups have no registering health worker.
    mothers().is("registered_by", null).gte("registration_date", monthStart),
    supabase.from("sms_setting").select("phone_online, phone_status_at, limit_reached_at").eq("setting_id", 1).maybeSingle(),
    // Every text HTTPSMS took this month, whatever happened to it after.
    texts().gte("sent_at", monthStartAt),
    texts(["DELIVERED"]).gte("sent_at", monthStartAt),
    logThisMonth("FAILED"),
    logThisMonth("SKIPPED"),
    texts(["PENDING"]),
    texts(["FAILED"]),
  ]);

  const motherCount = motherTotal.count ?? 0;
  const loginCount = withLogin.count ?? 0;
  return {
    accounts: {
      mothers: motherCount,
      mothersWithLogin: loginCount,
      mothersWithoutLogin: Math.max(motherCount - loginCount, 0),
      signedUpThisMonth: signedUp.count ?? 0,
      healthWorkers: healthWorkers.count ?? 0,
      admins: admins.count ?? 0,
      inactive: inactive.count ?? 0,
    },
    sms: {
      phoneOnline: setting.data?.phone_online ?? null,
      phoneStatusAt: setting.data?.phone_status_at ?? null,
      limitReachedAt: setting.data?.limit_reached_at ?? null,
      sentThisMonth: sent.count ?? 0,
      deliveredThisMonth: delivered.count ?? 0,
      failedThisMonth: failedMonth.count ?? 0,
      skippedThisMonth: skippedMonth.count ?? 0,
      waiting: waiting.count ?? 0,
      failed: failed.count ?? 0,
      limit: SMS_MONTHLY_LIMIT,
    },
  };
}
