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
