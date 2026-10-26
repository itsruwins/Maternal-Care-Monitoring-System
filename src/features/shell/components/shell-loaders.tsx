import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";
import { getShellUser } from "../queries/get-shell-user";
import { MotherShell } from "./mother-shell";
import { StaffShell } from "./staff-shell";

// Server wrappers: check the role, look up the display name, then render the
// shell. They read the session, so layouts wrap them in <Suspense>.

export async function StaffShellLoader({ roles, children }: { roles: readonly UserRole[]; children: ReactNode }) {
  const user = await requireRole(roles);
  const shellUser = await getShellUser(user);
  return <StaffShell user={shellUser}>{children}</StaffShell>;
}

export async function MotherShellLoader({ children }: { children: ReactNode }) {
  const user = await requireRole(["MOTHER"]);
  const shellUser = await getShellUser(user);
  return <MotherShell user={shellUser}>{children}</MotherShell>;
}

// Shown for a moment while the session loads.
export function ShellSkeleton() {
  return <div aria-hidden className="min-h-dvh bg-milk" />;
}
