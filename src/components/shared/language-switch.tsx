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
      className={cn("inline-flex rounded-full bg-white p-1 shadow-[var(--shadow-soft)]", className)}
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
              "h-8 min-w-10 rounded-full px-2.5 text-[0.8125rem] font-semibold transition-colors duration-200 sm:min-w-11",
              active ? "bg-leaf text-white" : "text-ink-soft hover:bg-cream hover:text-ink",
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
