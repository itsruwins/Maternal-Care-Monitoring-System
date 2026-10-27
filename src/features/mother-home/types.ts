import type { PregnancyOutcome } from "@/types/database";

export type MyCurrentPregnancy = { lmp: string | null; edd: string | null };
export type MyPastPregnancy = { id: number; outcome: PregnancyOutcome | null; outcomeDate: string | null };

/** What the mother's Today screen needs. */
export type MyToday = {
  firstName: string;
  current: MyCurrentPregnancy | null;
  past: MyPastPregnancy[];
};
