import type { Dictionary } from "@/i18n/get-dictionary";
import type { PurokField } from "./schemas";

export type PurokErrorKey = keyof Dictionary["puroks"]["errors"];

export type Purok = {
  id: number;
  name: string;
  isActive: boolean;
};

export type PurokFormState = {
  ok?: boolean;
  error?: PurokErrorKey;
  fieldErrors?: Partial<Record<PurokField, PurokErrorKey>>;
};
