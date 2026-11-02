import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Who prints a report: the "Prepared by" name and position (username when there's no staff profile). */
export async function getPreparer(user: { id: string; username: string }): Promise<{ name: string; position: string | null }> {
  const supabase = await createClient();
  const { data } = await supabase.from("health_worker").select("first_name, last_name, position").eq("user_id", user.id).maybeSingle();
  if (!data) return { name: user.username, position: null };
  return { name: `${data.first_name} ${data.last_name}`.trim(), position: data.position?.trim() || null };
}
