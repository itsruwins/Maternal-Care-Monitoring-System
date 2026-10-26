"use client";

import { createContext, use, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./get-dictionary";

type DictionaryContextValue = { locale: Locale; t: Dictionary };

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

// Makes the current language's text available to Client Components.
export function DictionaryProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return <DictionaryContext value={{ locale, t: dictionary }}>{children}</DictionaryContext>;
}

export function useDictionary(): DictionaryContextValue {
  const value = use(DictionaryContext);
  if (!value) throw new Error("useDictionary must be used inside <DictionaryProvider>");
  return value;
}
