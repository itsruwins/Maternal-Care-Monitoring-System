"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";
import { useDictionary } from "@/i18n/dictionary-provider";

// English / Filipino toggle. Saves the choice in a cookie, then reloads the
// current page in the new language (the web address doesn't change).
export function LanguageSwitch() {
  const { locale, t } = useDictionary();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={t.common.language} className="flex gap-1 text-sm">
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          disabled={pending || option === locale}
          onClick={() =>
            startTransition(async () => {
              await setLocale(option);
              router.refresh();
            })
          }
          className="rounded-md px-2 py-1 aria-pressed:font-semibold aria-pressed:underline"
        >
          {option === "en" ? t.common.english : t.common.filipino}
        </button>
      ))}
    </div>
  );
}
