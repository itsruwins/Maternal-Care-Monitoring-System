export const LOCALES = ["en", "fil"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Cookie that remembers the chosen language (1 year).
export const LOCALE_COOKIE = "mcms_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// Pick a language from the browser's Accept-Language header.
// Filipino ("fil") or Tagalog ("tl") → fil; anything else → en.
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if (tag.startsWith("fil") || tag.startsWith("tl")) return "fil";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
