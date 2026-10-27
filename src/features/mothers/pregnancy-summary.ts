import type { PregnancyOutcome, PregnancyStatus } from "@/types/database";
import { addDays, gestationalAge, PREGNANCY_DAYS, trimesterFromWeeks } from "@/lib/utils/pregnancy";
import type { PregnancyRecord, PregnancySummary } from "./types";

type PregnancyFields = {
  pregnancy_status: PregnancyStatus;
  lmp_date: string | null;
  expected_delivery_date: string | null;
  outcome: PregnancyOutcome | null;
  outcome_date: string | null;
  registration_date: string;
};

// The current pregnancy (weeks from the LMP, or from the due date when the LMP
// is unknown), else the most recent outcome. `today` is a Manila date.
export function summarizePregnancies(rows: PregnancyFields[], today: string): PregnancySummary {
  const active = rows.find((row) => row.pregnancy_status === "ACTIVE");
  if (active) {
    const lmp = active.lmp_date ?? (active.expected_delivery_date ? addDays(active.expected_delivery_date, -PREGNANCY_DAYS) : null);
    const age = lmp ? gestationalAge(lmp, today) : null;
    return {
      kind: "active",
      dueDate: active.expected_delivery_date,
      weeks: age?.weeks ?? null,
      trimester: age ? trimesterFromWeeks(age.weeks) : null,
    };
  }
  const latest = [...rows].sort((a, b) =>
    (b.outcome_date ?? b.registration_date).localeCompare(a.outcome_date ?? a.registration_date),
  )[0];
  return latest ? { kind: "closed", outcome: latest.outcome, outcomeDate: latest.outcome_date } : { kind: "none" };
}

/** summarizePregnancies for records already loaded by getMother. */
export function summarizeRecords(records: PregnancyRecord[], today: string): PregnancySummary {
  return summarizePregnancies(
    records.map((record) => ({
      pregnancy_status: record.status,
      lmp_date: record.lmp,
      expected_delivery_date: record.edd,
      outcome: record.outcome,
      outcome_date: record.outcomeDate,
      registration_date: record.registrationDate,
    })),
    today,
  );
}
