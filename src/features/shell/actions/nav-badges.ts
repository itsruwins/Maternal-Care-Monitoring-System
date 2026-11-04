"use server";

import { AREA_ROLES } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import type { NavBadges } from "../nav";
import { getNavBadges } from "../queries/nav-badges";

// The sidebar asks again after each page change (the layout itself stays put
// while moving between pages). Staff only; anyone else gets nothing.
export async function refreshNavBadges(): Promise<NavBadges | null> {
  const user = await getCurrentUser();
  if (!user || !(AREA_ROLES.staff as readonly string[]).includes(user.role)) return null;
  return getNavBadges();
}
