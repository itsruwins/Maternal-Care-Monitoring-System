import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SendingPanel } from "../types";

// The phone and plan status. Admins only (the database lets only admins read
// the settings).
export async function getSendingPanel(): Promise<SendingPanel> {
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("sms_setting")
    .select("phone_online, phone_status_at, limit_reached_at")
    .eq("setting_id", 1)
    .maybeSingle();
  return {
    phoneOnline: setting?.phone_online ?? null,
    phoneStatusAt: setting?.phone_status_at ?? null,
    limitReachedAt: setting?.limit_reached_at ?? null,
  };
}
