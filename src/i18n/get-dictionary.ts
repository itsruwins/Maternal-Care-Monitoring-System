import "server-only";
import type en from "./dictionaries/en.json";
import type { Locale } from "./config";

// English is the source of truth: every other language must have the same keys.
export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  fil: () => import("./dictionaries/fil.json").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
