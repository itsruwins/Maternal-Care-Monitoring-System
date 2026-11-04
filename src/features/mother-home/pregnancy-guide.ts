import { addDays, PREGNANCY_DAYS, trimesterFromWeeks, type Trimester } from "@/lib/utils/pregnancy";

// Plain rules behind the Today screen's tip and pregnancy bar (no medical
// interpretation: only her week and dates).

export type TipSets = { first: string[]; second: string[]; third: string[] };

/**
 * This week's tip: one from her trimester's set, changing each week. Past her
 * due date, the past-due message instead.
 */
export function weeklyTip(tips: TipSets, pastDue: string, weeks: number, isPastDue: boolean): string {
  if (isPastDue) return pastDue;
  const sets: Record<Trimester, string[]> = { 1: tips.first, 2: tips.second, 3: tips.third };
  const set = sets[trimesterFromWeeks(weeks)];
  return set[Math.max(0, weeks) % set.length];
}

/** First and last day (YYYY-MM-DD) of each trimester: weeks 0–13, 14–27, 28 to the due date. */
export function trimesterRanges(lmp: string, edd: string | null): { trimester: Trimester; from: string; to: string }[] | null {
  const second = addDays(lmp, 14 * 7);
  const third = addDays(lmp, 28 * 7);
  const due = edd ?? addDays(lmp, PREGNANCY_DAYS);
  if (!second || !third || !due) return null;
  return [
    { trimester: 1, from: lmp, to: addDays(second, -1)! },
    { trimester: 2, from: second, to: addDays(third, -1)! },
    { trimester: 3, from: third, to: due },
  ];
}

/**
 * How full each trimester's part of the bar is (0 to 1), from days pregnant.
 * The parts are 14, 14 and 12 weeks long; past 40 weeks every part is full.
 */
export function trimesterFill(daysPregnant: number): [number, number, number] {
  const part = (start: number, length: number) => Math.min(1, Math.max(0, (daysPregnant - start) / length));
  return [part(0, 98), part(98, 98), part(196, PREGNANCY_DAYS - 196)];
}
