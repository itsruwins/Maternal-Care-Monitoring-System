import type { AppointmentStatus, PregnancyOutcome } from "@/types/database";

export type MyCurrentPregnancy = { lmp: string | null; edd: string | null };
export type MyPastPregnancy = { id: number; outcome: PregnancyOutcome | null; outcomeDate: string | null };

/** One of her appointments, as the Today screen shows it. */
export type MyVisit = { at: string; service: string; status: AppointmentStatus };

/** Her latest recorded checkup in this pregnancy (plain numbers, no interpretation). */
export type MyLastVisit = { at: string; weeks: number; bpSystolic: number; bpDiastolic: number; weightKg: number };

/** What the mother's Today screen needs. */
export type MyToday = {
  firstName: string;
  current: MyCurrentPregnancy | null;
  past: MyPastPregnancy[];
  /** Her appointments (any status except cancelled), for the week strip. */
  visits: MyVisit[];
  /** Her next confirmed (or else waiting) visit. */
  nextVisit: MyVisit | null;
  /** Her latest checkup in the current pregnancy. */
  lastVisit: MyLastVisit | null;
};
