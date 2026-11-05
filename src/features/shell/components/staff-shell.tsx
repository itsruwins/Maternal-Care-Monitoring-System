"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";
import { refreshNavBadges } from "../actions/nav-badges";
import { ADMIN_NAV, isActive, STAFF_NAV, STAFF_PROFILE_HREF, type NavBadges, type NavItem } from "../nav";
import type { ShellUser } from "../queries/get-shell-user";
import { ProfileMenu } from "./profile-menu";

/** A stable empty set (a new {} each render would reset the counts every time). */
const NO_BADGES: NavBadges = {};

// The staff app (health workers and admins): a sidebar from 1024px, a menu
// button that opens the same sidebar as a sheet below that, and a top bar with
// the current section, language switch and profile menu. Admins get an extra
// "Admin" group in the same sidebar. Appointments carries a rose count of
// requests waiting for an answer (and the menu button a rose dot while any
// wait); with liveBadges it is checked again after every page change.
export function StaffShell({
  user,
  badges: initialBadges = NO_BADGES,
  liveBadges = false,
  notifications,
  children,
}: {
  user: ShellUser;
  badges?: NavBadges;
  /** Check the counts again after each page change (off in previews). */
  liveBadges?: boolean;
  /** The notification bell, beside the profile menu. */
  notifications?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useDictionary();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const badges = useNavBadges(initialBadges, liveBadges, pathname);
  const waiting = badges.appointments ?? 0;

  const current = [...STAFF_NAV, ...(isAdmin ? ADMIN_NAV : [])].find((item) => isActive(item, pathname));
  const sectionTitle = pathname.startsWith(STAFF_PROFILE_HREF) ? t.shell.nav.profile : current ? t.shell.nav[current.key] : "";

  const sidebar = (onNavigate?: () => void) => (
    <nav aria-label={t.shell.mainNav} className="flex flex-col gap-6 px-3 pb-6">
      <NavGroup items={STAFF_NAV} pathname={pathname} onNavigate={onNavigate} badges={badges} />
      {isAdmin && (
        <div>
          <p className="px-3 pb-2 text-caption font-semibold text-ink-soft">
            {t.shell.adminGroup}
          </p>
          <NavGroup items={ADMIN_NAV} pathname={pathname} onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-milk print:block print:min-h-0 print:bg-white">
      {/* Sidebar (desktop). Printing shows only the page itself. */}
      <aside className="sticky top-0 hidden h-dvh w-72 print:hidden shrink-0 flex-col overflow-y-auto border-r border-line bg-white lg:flex">
        <div className="px-5 pt-5 pb-6">
          <BrandMark href="/staff" />
        </div>
        {sidebar()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col print:block">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 print:hidden items-center gap-3 border-b border-line bg-white px-4 sm:px-6 lg:px-8">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label={waiting > 0 ? `${t.shell.menu}, ${badgeLabel(t.shell.badges.appointments, t.shell.badges.appointmentsOne, waiting)}` : t.shell.menu}
              className="relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-leaf lg:hidden"
            >
              <MenuIcon weight="bold" aria-hidden className="size-6" />
              {waiting > 0 && <span aria-hidden className="absolute top-2 right-2 size-2.5 rounded-full bg-rose-deep ring-2 ring-white" />}
            </SheetTrigger>
            <SheetContent closeLabel={t.shell.closeMenu}>
              <SheetTitle className="sr-only">{t.shell.mainNav}</SheetTitle>
              <SheetDescription className="sr-only">{user.fullName}</SheetDescription>
              <div className="px-5 pt-5 pb-6">
                <BrandMark href="/staff" />
              </div>
              {sidebar(() => setMenuOpen(false))}
            </SheetContent>
          </Sheet>

          <p className="truncate text-lg font-bold tracking-[-0.01em]">{sectionTitle}</p>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            {notifications}
            <ProfileMenu user={user} profileHref={STAFF_PROFILE_HREF} />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">{children}</main>
      </div>
    </div>
  );
}

function NavGroup({
  items,
  pathname,
  onNavigate,
  badges = {},
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  badges?: NavBadges;
}) {
  const { t } = useDictionary();
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(item, pathname);
        const ItemIcon = item.icon;
        const count = badges[item.key] ?? 0;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] no-underline transition-colors",
                active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink"
              )}
            >
              <ItemIcon weight={active ? "fill" : "regular"} aria-hidden className="size-5 shrink-0" />
              {t.shell.nav[item.key]}
              {count > 0 && item.key === "appointments" && (
                <span className="tnum ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1.5 text-caption font-bold text-white motion-safe:animate-pop">
                  <span aria-hidden>{count}</span>
                  <span className="sr-only">{badgeLabel(t.shell.badges.appointments, t.shell.badges.appointmentsOne, count)}</span>
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const badgeLabel = (many: string, one: string, count: number) => (count === 1 ? one : format(many, { count }));

/**
 * The sidebar counts: the layout's own (new after any refresh), then, when
 * live, asked again after each page change (the layout stays put while moving
 * between pages).
 */
function useNavBadges(initial: NavBadges, live: boolean, pathname: string): NavBadges {
  const [badges, setBadges] = useState(initial);
  const [seen, setSeen] = useState(initial);
  // A refresh brought new counts from the layout: take them.
  if (seen !== initial) {
    setSeen(initial);
    setBadges(initial);
  }
  const first = useRef(true);
  useEffect(() => {
    if (!live) return;
    if (first.current) {
      first.current = false;
      return;
    }
    let current = true;
    refreshNavBadges()
      .then((next) => {
        if (current && next) setBadges(next);
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [live, pathname]);
  return badges;
}
