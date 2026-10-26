import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { ROLE_HOME } from "./roles";

export type CurrentUser = {
  id: string;
  username: string;
  role: UserRole;
};

// The logged-in user, or null. INACTIVE accounts count as logged out.
// Reads cookies, so call it only inside a <Suspense> boundary.
// Cached per request, so calling it many times costs one lookup.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: account } = await supabase
    .from("user_account")
    .select("user_id, username, role, account_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!account || account.account_status !== "ACTIVE") return null;

  return { id: account.user_id, username: account.username, role: account.role };
});

// Use at the top of every protected page and Server Action.
// Not logged in → /login. Wrong role → that user's own home page.
export async function requireRole(allowed: readonly UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowed.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}
