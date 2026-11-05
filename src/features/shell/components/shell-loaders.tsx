import type { ReactNode } from "react";
import {
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  refreshUnreadCount,
} from "@/features/notifications/actions/notifications";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getUnreadCount } from "@/features/notifications/queries/notifications";
import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";
import { getShellUser } from "../queries/get-shell-user";
import { getNavBadges } from "../queries/nav-badges";
import { MotherShell } from "./mother-shell";
import { StaffShell } from "./staff-shell";

// Server wrappers: check the role, look up the display name and the unread
// notification count, then render the shell with its bell. They read the
// session, so layouts wrap them in <Suspense>.

function Bell({ role, unread }: { role: UserRole; unread: number }) {
  return (
    <NotificationBell
      readerRole={role}
      unread={unread}
      load={loadNotifications}
      markRead={markNotificationRead}
      markAll={markAllNotificationsRead}
      refreshUnread={refreshUnreadCount}
    />
  );
}

export async function StaffShellLoader({ roles, children }: { roles: readonly UserRole[]; children: ReactNode }) {
  const user = await requireRole(roles);
  const [shellUser, badges, unread] = await Promise.all([getShellUser(user), getNavBadges(), getUnreadCount()]);
  return (
    <StaffShell user={shellUser} badges={badges} liveBadges notifications={<Bell role={user.role} unread={unread} />}>
      {children}
    </StaffShell>
  );
}

export async function MotherShellLoader({ children }: { children: ReactNode }) {
  const user = await requireRole(["MOTHER"]);
  const [shellUser, unread] = await Promise.all([getShellUser(user), getUnreadCount()]);
  return (
    <MotherShell user={shellUser} notifications={<Bell role={user.role} unread={unread} />}>
      {children}
    </MotherShell>
  );
}

// Shown for a moment while the session loads.
export function ShellSkeleton() {
  return <div aria-hidden className="min-h-dvh bg-milk" />;
}
