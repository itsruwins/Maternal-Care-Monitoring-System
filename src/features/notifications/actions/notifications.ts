"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isId } from "@/lib/validation/ids";
import { getUnreadCount, listNotifications } from "../queries/notifications";
import type { NotificationCursor, NotificationPage } from "../types";

// What the bell calls. Any logged-in, active account; each reads and marks
// only its own (the database checks that too).

/** A timestamp as Postgres writes it, e.g. 2026-11-05T03:00:00.123456+00:00. */
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;

export async function loadNotifications(before: NotificationCursor | null): Promise<NotificationPage> {
  const user = await getCurrentUser();
  if (!user) throw new Error("not_logged_in");
  if (before !== null && !(isId(before?.id) && typeof before.createdAt === "string" && TIMESTAMP.test(before.createdAt))) {
    throw new Error("bad_cursor");
  }
  return listNotifications(before);
}

/** The unread count for the 60-second check; null when logged out. */
export async function refreshUnreadCount(): Promise<number | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getUnreadCount();
}

export async function markNotificationRead(id: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isId(id)) return;
  const supabase = await createClient();
  await supabase.rpc("mark_notification_read", { p_notification_id: id });
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.rpc("mark_all_notifications_read");
}
