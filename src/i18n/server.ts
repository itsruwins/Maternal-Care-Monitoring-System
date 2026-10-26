import "server-only";
import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./get-dictionary";

// Current language + its text, for Server Components (reads the hidden [lang] root param).
export async function getServerI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const value = await lang();
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  return { locale, t: await getDictionary(locale) };
}
