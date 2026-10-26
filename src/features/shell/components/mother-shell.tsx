"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cn } from "@/lib/utils/cn";
import { isActive, MOTHER_NAV } from "../nav";
import type { ShellUser } from "../queries/get-shell-user";
import { ProfileMenu } from "./profile-menu";

const PROFILE_HREF = "/mother/profile";

// The mother portal: a slim top bar (brand, language, profile menu) and a
// floating bottom navigation on every screen size (outline icons, the
// selected one filled on a mint pill).
export function MotherShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const { t } = useDictionary();
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-milk">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <BrandMark href="/mother" />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            <ProfileMenu user={user} profileHref={PROFILE_HREF} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-36 sm:px-6">{children}</main>

      {/* Floating bottom navigation (all screen sizes): a white pill above the
          page; the selected tab gets a mint pill and a filled icon. */}
      <nav
        aria-label={t.shell.mainNav}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full border border-line bg-white p-1.5 shadow-[var(--shadow-float)]"
      >
        <ul className="grid grid-cols-4 gap-1">
          {MOTHER_NAV.map((item) => {
            const active = isActive(item, pathname);
            const ItemIcon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[0.6875rem] no-underline transition-colors duration-200",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink"
                  )}
                >
                  <ItemIcon weight={active ? "fill" : "regular"} aria-hidden className="size-6" />
                  {t.shell.nav[item.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
