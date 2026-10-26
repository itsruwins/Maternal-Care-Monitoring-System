import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "../types";

// Every activity type, in the order they were added (the 5 seeded ones first).
export async function listActivityTypes(): Promise<ActivityType[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_type")
    .select("activity_type_id, name, description, reminder_days_before")
    .order("activity_type_id");
  return (data ?? []).map((row) => ({
    id: row.activity_type_id,
    name: row.name,
    description: row.description,
    reminderDaysBefore: row.reminder_days_before,
  }));
}
