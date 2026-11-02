"use client";

import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { AuthDialogTrigger } from "@/features/auth/components/auth-dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cn } from "@/lib/utils/cn";

const SECTIONS = ["how", "services", "center", "tips"] as const;

// Top bar of the website: seal + name, section links (desktop), language,
// log in and sign up.
export function SiteHeader({ className }: { className?: string }) {
  const { t } = useDictionary();

  return (
    <header className={cn("px-4 pt-4 sm:px-6", className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1.5 min-[400px]:gap-2 sm:gap-3">
        <BrandMark compact wrap className="min-w-0" />

        <nav aria-label={t.landing.nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex h-10 items-center rounded-full px-4 text-[0.95rem] font-medium text-ink-soft no-underline transition-colors hover:bg-white/70 hover:text-ink"
                >
                  {t.landing.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1 min-[400px]:gap-1.5 sm:gap-2.5">
          {/* Narrower EN/FIL below 400px so "Mag-log in" leaves room for the name. */}
          <LanguageSwitch className="max-[399px]:[&>button]:min-w-9 max-[399px]:[&>button]:px-2" />
          <AuthDialogTrigger mode="login">
            <Button variant="ghost" size="sm" className="h-10 px-1.5 text-[0.95rem] hover:bg-white/70 min-[400px]:px-2.5 sm:px-4">
              {t.nav.login}
            </Button>
          </AuthDialogTrigger>
          <AuthDialogTrigger mode="signup">
            <Button size="sm" className="hidden h-10 px-5 text-[0.95rem] sm:inline-flex">
              {t.nav.signup}
            </Button>
          </AuthDialogTrigger>
        </div>
      </div>
    </header>
  );
}
