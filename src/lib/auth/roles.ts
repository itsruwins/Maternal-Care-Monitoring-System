import type { UserRole } from "@/types/database";

// Where each role lands after login. Admins use the staff app (with an extra
// Admin group in the sidebar), so they land on the staff home too.
export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/staff",
  HEALTH_WORKER: "/staff",
  MOTHER: "/mother",
};

// Roles allowed in each area. Admins can also use staff screens.
export const AREA_ROLES = {
  admin: ["ADMIN"],
  staff: ["ADMIN", "HEALTH_WORKER"],
  mother: ["MOTHER"],
} as const satisfies Record<string, readonly UserRole[]>;

// URL prefixes that need a login (checked quickly in proxy.ts; the real
// role check happens on the server with requireRole()).
export const PROTECTED_PREFIXES = ["/admin", "/staff", "/mother"] as const;
