"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { useDictionary } from "@/i18n/dictionary-provider";

// The folder bar above the card: seal + name, language, log in / sign up.
export function SiteHeader() {
  const { t } = useDictionary();

  return (
    <header className="px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <BrandMark />
        <nav aria-label="Account" className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitch />
          <LoginDialog>
            <Button variant="ghost" size="sm" className="px-2.5 text-[0.95rem] sm:px-3.5">
              {t.nav.login}
            </Button>
          </LoginDialog>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/register">{t.nav.signup}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
