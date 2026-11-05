"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DangerIcon, NotificationIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types/database";
import { badgeText, describeNotification, groupByDay, notificationTime } from "../describe";
import { NOTIFICATION_KINDS, notificationHref } from "../kinds";
import type { NotificationCursor, NotificationItem, NotificationPage } from "../types";

export type { NotificationCursor };

/** How often the count is checked while the tab is open and visible. */
const CHECK_EVERY_MS = 60_000;

type Status = "idle" | "loading" | "ready" | "error";

// The bell in the top bar (staff and mother shells): the unread count on a
// rose badge, and a panel with the newest 20 grouped under Today and Earlier,
// "Show older" for 20 more, and "Mark all as read". Clicking one marks it read
// and opens its page. The list loads each time the panel opens. With
// refreshUnread, the count is checked every 60 seconds while the tab is
// visible, when the tab comes back into view and after each page change (the
// list too, while the panel is open). The data comes through the functions
// passed in (server actions in the app, sample data in the design preview).
export function NotificationBell({
  readerRole,
  unread: initialUnread,
  load,
  markRead,
  markAll,
  refreshUnread,
  now: fixedNow,
  defaultOpen = false,
}: {
  readerRole: UserRole;
  /** The unread count when the page was built. */
  unread: number;
  load: (before: NotificationCursor | null) => Promise<NotificationPage>;
  markRead: (id: number) => Promise<void>;
  markAll: () => Promise<void>;
  /** The current unread count (null when logged out); off in previews. */
  refreshUnread?: () => Promise<number | null>;
  /** Previews: a fixed "now" for the times shown. */
  now?: string;
  /** Previews: open on first render. */
  defaultOpen?: boolean;
}) {
  const { t } = useDictionary();
  const texts = t.notifications;
  const headingId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [unread, setUnread] = useState(initialUnread);
  // The layout built a new count (e.g. after a refresh): take it.
  const [seenUnread, setSeenUnread] = useState(initialUnread);
  if (seenUnread !== initialUnread) {
    setSeenUnread(initialUnread);
    setUnread(initialUnread);
  }
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<Status>(defaultOpen ? "loading" : "idle");
  const [olderStatus, setOlderStatus] = useState<Status>("idle");
  // Only the newest load may land (a slow first load must not undo a later one).
  const loadRun = useRef(0);

  const refresh = useCallback(async () => {
    const run = ++loadRun.current;
    setStatus((current) => (current === "ready" ? "ready" : "loading"));
    try {
      const page = await load(null);
      if (run !== loadRun.current) return;
      setItems(page.items);
      setHasMore(page.hasMore);
      setUnread(page.unread);
      setStatus("ready");
    } catch {
      if (run !== loadRun.current) return;
      setStatus((current) => (current === "ready" ? "ready" : "error"));
    }
  }, [load]);

  // A preview that starts open loads once, as if just opened.
  const startedOpen = useRef(defaultOpen);
  useEffect(() => {
    if (!startedOpen.current) return;
    startedOpen.current = false;
    void refresh();
  }, [refresh]);

  // The 60-second check, and again when the tab comes back into view.
  const check = useCallback(() => {
    if (!refreshUnread || document.visibilityState !== "visible") return;
    if (open) {
      void refresh();
      return;
    }
    refreshUnread()
      .then((count) => {
        if (count !== null) setUnread(count);
      })
      .catch(() => {});
  }, [refreshUnread, refresh, open]);

  useEffect(() => {
    if (!refreshUnread) return;
    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [refreshUnread, check]);

  // After each page change (the shell stays put while moving between pages).
  const pathname = usePathname();
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (firstPath.current === pathname) return;
    firstPath.current = pathname;
    check();
  }, [pathname, check]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void refresh();
  }

  async function showOlder() {
    const last = items?.at(-1);
    if (!last) return;
    setOlderStatus("loading");
    try {
      const page = await load({ createdAt: last.createdAt, id: last.id });
      setItems((current) => {
        const seen = new Set((current ?? []).map((item) => item.id));
        return [...(current ?? []), ...page.items.filter((item) => !seen.has(item.id))];
      });
      setHasMore(page.hasMore);
      setUnread(page.unread);
      setOlderStatus("idle");
    } catch {
      setOlderStatus("error");
    }
  }

  function openItem(item: NotificationItem) {
    setOpen(false);
    if (item.read) return;
    setItems((current) => current?.map((each) => (each.id === item.id ? { ...each, read: true } : each)) ?? current);
    setUnread((count) => Math.max(0, count - 1));
    // It didn't save (e.g. no signal): show what's really unread again.
    markRead(item.id).catch(() => void refresh());
  }

  function readAll() {
    setItems((current) => current?.map((each) => ({ ...each, read: true })) ?? current);
    setUnread(0);
    markAll().catch(() => void refresh());
  }

  const now = fixedNow ? new Date(fixedNow) : new Date();
  const groups = items ? groupByDay(items, now) : null;
  const forMother = readerRole === "MOTHER";
  const label =
    unread === 0 ? texts.bell : unread === 1 ? texts.bellUnreadOne : format(texts.bellUnread, { count: unread });

  const group = (heading: string, list: NotificationItem[]) =>
    list.length > 0 && (
      <section aria-label={heading}>
        <h3 className="px-3 pt-3 pb-1 text-caption font-semibold text-ink-soft">{heading}</h3>
        <ul className="flex flex-col">
          {list.map((item) => (
            <li key={item.id}>
              <NotificationRow item={item} now={now} readerRole={readerRole} onOpen={openItem} />
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors outline-none hover:bg-cream focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-leaf",
          open && "bg-cream",
        )}
      >
        <NotificationIcon weight={open ? "fill" : "regular"} aria-hidden className="size-6" />
        {unread > 0 && (
          <span
            aria-hidden
            className="tnum absolute -top-0.5 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1 text-caption leading-none font-bold text-white ring-2 ring-white motion-safe:animate-pop"
          >
            {badgeText(unread)}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        aria-labelledby={headingId}
        className="flex max-h-[min(40rem,calc(100dvh-5.5rem))] w-[calc(100vw-2rem)] max-w-[26rem] flex-col"
      >
        {/* "Mark all as read" stays on one line; when it doesn't fit beside the title it drops under it, its text in line with the title. */}
        <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-x-3 border-b border-line py-1.5 pr-2 pl-4">
          <h2 id={headingId} className="text-lg font-extrabold tracking-[-0.01em] whitespace-nowrap">
            {texts.title}
          </h2>
          {unread > 0 && status === "ready" && (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 min-h-11 px-3 whitespace-nowrap text-leaf hover:text-leaf-deep"
              onClick={readAll}
            >
              {texts.markAll}
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
          {status === "loading" && !items && <LoadingRows label={texts.loading} />}

          {status === "error" && !items && (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <IconCircle icon={DangerIcon} tone="blush" size="lg" />
              <p role="alert" className="mt-4 max-w-[30ch] text-[0.95rem] font-semibold text-rose-deep">
                {texts.error}
              </p>
              <Button variant="soft" className="mt-4" onClick={() => void refresh()}>
                {texts.retry}
              </Button>
            </div>
          )}

          {groups && items && items.length === 0 && (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <IconCircle icon={NotificationIcon} tone="mint" size="lg" />
              <p className="mt-4 text-[1.05rem] font-bold">{texts.emptyTitle}</p>
              <p className="mt-1 max-w-[30ch] text-sm leading-6 text-ink-soft">{forMother ? texts.emptyMother : texts.emptyStaff}</p>
            </div>
          )}

          {groups && (
            <>
              {group(texts.today, groups.today)}
              {group(texts.earlier, groups.earlier)}
            </>
          )}

          {items && items.length > 0 && (
            <div className="px-1.5 pt-2 pb-1.5">
              <div role="status">
                {olderStatus === "error" && (
                  <p className="flex items-center justify-center gap-1.5 px-3 pb-2 text-sm font-semibold text-rose-deep">
                    <DangerIcon weight="fill" aria-hidden className="size-4 shrink-0" />
                    {texts.errorOlder}
                  </p>
                )}
              </div>
              {hasMore ? (
                <Button
                  variant="soft"
                  className="w-full"
                  onClick={() => void showOlder()}
                  disabled={olderStatus === "loading"}
                  aria-busy={olderStatus === "loading" || undefined}
                >
                  {olderStatus === "loading" ? (
                    <>
                      <SpinnerIcon aria-hidden className="motion-safe:animate-spin" />
                      {texts.loadingOlder}
                    </>
                  ) : olderStatus === "error" ? (
                    texts.retry
                  ) : (
                    texts.showOlder
                  )}
                </Button>
              ) : (
                <p className="px-3 py-2 text-center text-caption font-medium text-ink-soft">{texts.end}</p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** One notification: its icon, title, detail line, time and the unread dot; the whole row opens its page. */
export function NotificationRow({
  item,
  now,
  readerRole,
  onOpen,
}: {
  item: NotificationItem;
  now: Date;
  readerRole: UserRole;
  onOpen?: (item: NotificationItem) => void;
}) {
  const { t, locale } = useDictionary();
  const texts = t.notifications;
  const kind = NOTIFICATION_KINDS[item.type];
  const { title, detail } = describeNotification(item, texts, t.shell.roles, locale, readerRole);
  return (
    <Link
      href={notificationHref(item, readerRole === "MOTHER")}
      onClick={() => onOpen?.(item)}
      className="flex gap-3 rounded-xl px-3 py-3 text-ink no-underline transition-colors outline-none hover:bg-cream focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-leaf"
    >
      <IconCircle icon={kind.icon} tone={kind.tone} size="sm" />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[0.95rem] leading-snug", item.read ? "font-medium" : "font-bold")}>{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{detail}</span>
        <span className="mt-1 block text-caption font-medium text-ink-soft">
          <span className="tnum">{notificationTime(item.createdAt, now, texts, locale)}</span>
        </span>
      </span>
      {!item.read && (
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-leaf">
          <span className="sr-only">{texts.unread}</span>
        </span>
      )}
    </Link>
  );
}

function LoadingRows({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((n) => (
        <div key={n} aria-hidden className="flex gap-3 px-3 py-3">
          <span className="size-9 shrink-0 rounded-full bg-cream motion-safe:animate-pulse" />
          <span className="flex-1 space-y-2 pt-1">
            <span className="block h-3.5 w-3/4 rounded-full bg-cream motion-safe:animate-pulse" />
            <span className="block h-3 w-1/2 rounded-full bg-cream motion-safe:animate-pulse" />
          </span>
        </div>
      ))}
    </div>
  );
}
