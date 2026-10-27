import type { Dictionary } from "@/i18n/get-dictionary";
import type { PregnancyOutcome } from "@/types/database";
import type { Trimester } from "@/lib/utils/pregnancy";

export type MotherStatusFilter = "pregnant" | "notPregnant" | "";

export type MotherFilters = {
  q: string;
  /** A purok id, "none" (no purok yet) or "" (all). */
  purok: number | "none" | "";
  /** Due month "YYYY-MM" or "". */
  due: string;
  status: MotherStatusFilter;
  page: number;
};

/** Where a mother is now: pregnant (with weeks), her last outcome, or nothing recorded. */
export type PregnancySummary =
  | { kind: "active"; dueDate: string | null; weeks: number | null; trimester: Trimester | null }
  | { kind: "closed"; outcome: PregnancyOutcome | null; outcomeDate: string | null }
  | { kind: "none" };

export type MotherListItem = {
  id: number;
  name: string;
  contactNumber: string;
  purok: string | null;
  hasLogin: boolean;
  pregnancy: PregnancySummary;
};

export type MotherErrorKey = keyof Dictionary["mothers"]["errors"];

export type FormState<Field extends string> = {
  ok?: boolean;
  error?: MotherErrorKey;
  fieldErrors?: Partial<Record<Field, MotherErrorKey>>;
};

/** What the registration form shows once she is registered. */
export type RegisteredMother = { motherId: number; name: string; username: string | null };
