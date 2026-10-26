"use client";

import Link from "next/link";
import { ArrowRightIcon, HeartIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { useDictionary } from "@/i18n/dictionary-provider";

// The page's close: one last, calm invitation to sign up.
export function ClosingCta() {
  const { t } = useDictionary();
  const c = t.landing.closing;

  return (
    <section aria-labelledby="closing-title" className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center overflow-hidden rounded-[2.5rem] bg-[radial-gradient(120%_100%_at_50%_0%,#f6e6e1_0%,#f2dfd6_55%,#ead9c9_100%)] px-6 py-14 text-center sm:px-12 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1/2 -left-1/4 aspect-square w-3/4 rounded-full border-[28px] border-white/35"
        />
        <HeartIcon weight="fill" aria-hidden className="relative size-9 text-rose" />
        <h2 id="closing-title" className="text-title relative mt-4 font-bold">
          {c.title}
        </h2>
        <p className="relative mt-3 max-w-[40ch] text-lg leading-7 text-ink-soft">{c.body}</p>
        <div className="relative mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">
              {t.landing.signup}
              <ArrowRightIcon weight="bold" aria-hidden />
            </Link>
          </Button>
          <LoginDialog>
            <Button variant="secondary" size="lg">
              {t.landing.login}
            </Button>
          </LoginDialog>
        </div>
      </div>
    </section>
  );
}
