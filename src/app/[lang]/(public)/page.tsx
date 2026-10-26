import Link from "next/link";
import { lang } from "next/root-params";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { SITE } from "@/config/site";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// Phase 0 placeholder. The real landing page is built in Phase 1.
export default async function LandingPage() {
  const locale = await lang();
  const t = await getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 p-6">
      <LanguageSwitch />
      <h1 className="text-2xl font-semibold">{SITE.name}</h1>
      <p>
        {SITE.fullTitle}, {SITE.location}
      </p>
      <p className="text-neutral-600">{t.landing.placeholder}</p>
      <Link href="/login" className="rounded-md border px-4 py-2">
        {t.landing.login}
      </Link>
    </main>
  );
}
