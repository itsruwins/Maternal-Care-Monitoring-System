import "server-only";
import { cache } from "react";
import type { CurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ShellUser = {
  username: string;
  role: CurrentUser["role"];
  /** First name for greetings, or the username when no profile exists. */
  firstName: string;
  /** Full name for the profile menu. */
  fullName: string;
};

// The name shown in the shell: from the staff profile (health_worker) or the
// mother record. Falls back to the username.
export const getShellUser = cache(async (user: CurrentUser): Promise<ShellUser> => {
  const supabase = await createClient();
  const table = user.role === "MOTHER" ? "mother" : "health_worker";
  const { data } = await supabase
    .from(table)
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const first = data?.first_name?.trim();
  const last = data?.last_name?.trim();
  return {
    username: user.username,
    role: user.role,
    firstName: first || user.username,
    fullName: [first, last].filter(Boolean).join(" ") || user.username,
  };
});
