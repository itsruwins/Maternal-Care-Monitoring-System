"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cn } from "@/lib/utils/cn";
import { ADMIN_NAV, isActive, STAFF_NAV, STAFF_PROFILE_HREF, type NavItem } from "../nav";
import type { ShellUser } from "../queries/get-shell-user";
import { ProfileMenu } from "./profile-menu";

// The staff app (health workers and admins): a sidebar from 1024px, a menu
// button that opens the same sidebar as a sheet below that, and a top bar with
// the current section, language switch and profile menu. Admins get an extra
// "Admin" group in the same sidebar.
export function StaffShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const { t } = useDictionary();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";

  const current = [...STAFF_NAV, ...(isAdmin ? ADMIN_NAV : [])].find((item) => isActive(item, pathname));
  const sectionTitle = pathname.startsWith(STAFF_PROFILE_HREF) ? t.shell.nav.profile : current ? t.shell.nav[current.key] : "";

  const sidebar = (onNavigate?: () => void) => (
    <nav aria-label={t.shell.mainNav} className="flex flex-col gap-6 px-3 pb-6">
      <NavGroup items={STAFF_NAV} pathname={pathname} onNavigate={onNavigate} />
      {isAdmin && (
        <div>
          <p className="px-3 pb-2 text-caption font-semibold tracking-[0.02em] text-ink-soft uppercase">
            {t.shell.adminGroup}
          </p>
          <NavGroup items={ADMIN_NAV} pathname={pathname} onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-milk">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col overflow-y-auto border-r border-line bg-white lg:flex">
        <div className="px-5 pt-5 pb-6">
          <BrandMark href="/staff" />
        </div>
        {sidebar()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6 lg:px-8">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label={t.shell.menu}
              className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-leaf lg:hidden"
            >
              <MenuIcon weight="bold" aria-hidden className="size-6" />
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

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            <ProfileMenu user={user} profileHref={STAFF_PROFILE_HREF} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function NavGroup({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const { t } = useDictionary();
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(item, pathname);
        const ItemIcon = item.icon;
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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
