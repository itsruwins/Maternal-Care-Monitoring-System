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
// floating bottom navigation on every screen size (icons; the selected tab
// opens into a mint pill with its name).
export function MotherShell({ user, children, previewPath }: { user: ShellUser; children: ReactNode; /** Dev previews: which tab is current. */ previewPath?: string }) {
  const { t } = useDictionary();
  const routePath = usePathname();
  const pathname = previewPath ?? routePath;

  return (
    <div className="flex min-h-dvh flex-col bg-milk">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <BrandMark href="/mother" compact />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            <ProfileMenu user={user} profileHref={PROFILE_HREF} />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-32 outline-none sm:px-6">{children}</main>

      {/* Floating bottom navigation (all screen sizes): a snug white pill.
          Tabs are icons; the selected one grows into a mint pill with its name.
          The name slides open by animating its grid column from 0fr to 1fr.
          When a menu or dialog hides the page scrollbar, the page makes up for
          it (--removed-body-scroll-bar-size), so the nav shifts by half of it
          to stay centred over the page instead of jumping. */}
      <nav
        aria-label={t.shell.mainNav}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(50%-var(--removed-body-scroll-bar-size,0px)/2)] z-30 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-line bg-white/95 p-1.5 shadow-[var(--shadow-float)] backdrop-blur"
      >
        <ul className="flex items-center gap-1">
          {MOTHER_NAV.map((item) => {
            const active = isActive(item, pathname);
            const ItemIcon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center rounded-full px-3.5 text-[0.95rem] no-underline",
                    "transition-[background-color,color,padding] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    active ? "bg-mint pr-4.5 font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  <ItemIcon weight={active ? "fill" : "regular"} aria-hidden className="size-6 shrink-0" />
                  <span
                    className={cn(
                      "grid transition-[grid-template-columns,opacity,margin] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                      active ? "ml-2 grid-cols-[1fr] opacity-100" : "ml-0 grid-cols-[0fr] opacity-0",
                    )}
                  >
                    {/* Still read by screen readers when folded. */}
                    <span className="overflow-hidden whitespace-nowrap">{t.shell.nav[item.key]}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
