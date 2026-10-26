"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cn } from "@/lib/utils/cn";

const SHORT = { en: "EN", fil: "FIL" } as const;

// EN / FIL toggle. Saves the choice in a cookie, then reloads the current page
// in the new language (the web address doesn't change).
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useDictionary();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn("inline-flex rounded-md border border-ink-label/40 bg-card-stock p-0.5", className)}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            aria-label={option === "en" ? t.common.english : t.common.filipino}
            disabled={pending}
            onClick={() => {
              if (active) return;
              startTransition(async () => {
                await setLocale(option);
                router.refresh();
              });
            }}
            className={cn(
              "label-print h-8 min-w-9 rounded-[4px] px-1.5 text-[0.72rem] transition-colors duration-150 sm:min-w-11 sm:px-2",
              active ? "bg-press text-card-stock" : "text-ink-label hover:bg-ink/6 hover:text-ink",
              pending && "cursor-progress"
            )}
          >
            {SHORT[option]}
          </button>
        );
      })}
    </div>
  );
}
