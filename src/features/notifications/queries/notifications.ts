import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/types/database";
import type { NotificationCursor, NotificationDetails, NotificationItem, NotificationPage } from "../types";

// The logged-in person's notifications, read as them (RLS: only their own,
// nothing while their account is inactive).

const PAGE_SIZE = 20;
const COLUMNS = "notification_id, notification_type, appointment_id, mother_id, visit_id, details, created_at, read_at";

/** Their unread count (for the bell's badge). */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notification")
    .select("notification_id", { count: "exact", head: true })
    .is("read_at", null);
  return count ?? 0;
}

/** The newest 20, or the 20 just older than `before`; plus whether more exist and the unread count. */
export async function listNotifications(before: NotificationCursor | null): Promise<NotificationPage> {
  const supabase = await createClient();
  let query = supabase
    .from("notification")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .order("notification_id", { ascending: false })
    .limit(PAGE_SIZE + 1);
  if (before) {
    // Older than the last one shown (same time: a smaller id). The time is
    // quoted, so its "+", ":" and "." stay part of the value.
    query = query.or(`created_at.lt."${before.createdAt}",and(created_at.eq."${before.createdAt}",notification_id.lt.${before.id})`);
  }
  const [{ data, error }, unread] = await Promise.all([query, getUnreadCount()]);
  if (error) throw new Error("notifications_unavailable");
  const rows = (data ?? []) as Pick<NotificationRow, "notification_id" | "notification_type" | "appointment_id" | "mother_id" | "visit_id" | "details" | "created_at" | "read_at">[];
  return {
    items: rows.slice(0, PAGE_SIZE).map(
      (row): NotificationItem => ({
        id: row.notification_id,
        type: row.notification_type,
        createdAt: row.created_at,
        read: row.read_at !== null,
        details: (row.details ?? {}) as NotificationDetails,
        appointmentId: row.appointment_id,
        motherId: row.mother_id,
        visitId: row.visit_id,
      }),
    ),
    hasMore: rows.length > PAGE_SIZE,
    unread,
  };
}
