"use client";

import { useRef, useState } from "react";
import { NotificationBell, NotificationRow, type NotificationCursor } from "@/features/notifications/components/notification-bell";
import type { NotificationItem, NotificationPage } from "@/features/notifications/types";
import type { UserRole } from "@/types/database";

export type DemoState = "default" | "empty" | "loading" | "error" | "many";

const PAGE = 20;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const older = (a: NotificationItem, cursor: NotificationCursor) =>
  a.createdAt < cursor.createdAt || (a.createdAt === cursor.createdAt && a.id < cursor.id);

// Development only (preview): the real bell on sample data. Loads take half a
// second; marking read lasts until the page is reloaded.
export function BellDemo({
  role,
  items,
  state,
  now,
  open,
}: {
  role: UserRole;
  items: NotificationItem[];
  state: DemoState;
  now: string;
  open: boolean;
}) {
  const [start] = useState(() => (state === "empty" ? [] : state === "many" ? items.map((each) => ({ ...each, read: false })) : items));
  const list = useRef(start);
  const unread = () => list.current.filter((each) => !each.read).length;

  async function load(before: NotificationCursor | null): Promise<NotificationPage> {
    if (state === "loading") return new Promise(() => {});
    await wait(500);
    if (state === "error") throw new Error("sample");
    const rest = before ? list.current.filter((each) => older(each, before)) : list.current;
    return { items: rest.slice(0, PAGE), hasMore: rest.length > PAGE, unread: unread() };
  }

  async function markRead(id: number) {
    list.current = list.current.map((each) => (each.id === id ? { ...each, read: true } : each));
  }

  async function markAll() {
    list.current = list.current.map((each) => ({ ...each, read: true }));
  }

  return (
    <NotificationBell
      readerRole={role}
      unread={start.filter((each) => !each.read).length}
      load={load}
      markRead={markRead}
      markAll={markAll}
      now={now}
      defaultOpen={open}
    />
  );
}

/** Every kind for this reader, as the rows read (for checking the wording). */
export function KindList({ role, items, now }: { role: UserRole; items: NotificationItem[]; now: string }) {
  const at = new Date(now);
  return (
    <ul className="flex flex-col divide-y divide-line">
      {items.map((each) => (
        <li key={each.id}>
          <NotificationRow item={each} now={at} readerRole={role} />
        </li>
      ))}
    </ul>
  );
}
