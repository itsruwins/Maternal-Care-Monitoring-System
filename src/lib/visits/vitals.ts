// Vital signs at a prenatal visit. HARD limits match migration 0014 (values no
// person can have, so they must be typos). SOFT ranges only ask the health
// worker to double-check; they are not a diagnosis and are never shown to
// mothers as advice.

export const VITALS = ["bpSystolic", "bpDiastolic", "weightKg", "temperatureC", "pulseRate", "fundalHeightCm", "fetalHeartRate"] as const;
export type VitalKey = (typeof VITALS)[number];

export const HARD: Record<VitalKey, { min: number; max: number }> = {
  bpSystolic: { min: 60, max: 250 },
  bpDiastolic: { min: 30, max: 150 },
  weightKg: { min: 30, max: 200 },
  temperatureC: { min: 34, max: 42 },
  pulseRate: { min: 40, max: 200 },
  fundalHeightCm: { min: 5, max: 50 },
  fetalHeartRate: { min: 80, max: 220 },
};

const SOFT: Record<VitalKey, { min: number; max: number }> = {
  bpSystolic: { min: 90, max: 139 },
  bpDiastolic: { min: 60, max: 89 },
  weightKg: { min: 40, max: 110 },
  temperatureC: { min: 35.5, max: 37.7 },
  pulseRate: { min: 50, max: 110 },
  fundalHeightCm: { min: 5, max: 45 },
  fetalHeartRate: { min: 110, max: 160 },
};

/** Fields to double-check (unusual but possible values). */
export function doubleCheck(
  values: Partial<Record<VitalKey, number | null>>,
  context: { weeks: number | null; lastWeightKg: number | null },
): VitalKey[] {
  const flagged = new Set<VitalKey>();
  for (const key of VITALS) {
    const value = values[key];
    if (value == null || Number.isNaN(value)) continue;
    if (value < SOFT[key].min || value > SOFT[key].max) flagged.add(key);
  }
  // A big jump from the last visit's weight.
  if (values.weightKg != null && context.lastWeightKg != null && Math.abs(values.weightKg - context.lastWeightKg) > 5) {
    flagged.add("weightKg");
  }
  // From week 20, fundal height in cm is usually close to the weeks of pregnancy.
  if (values.fundalHeightCm != null && context.weeks != null && context.weeks >= 20 && Math.abs(values.fundalHeightCm - context.weeks) > 4) {
    flagged.add("fundalHeightCm");
  }
  return [...flagged];
}

/** Days until the next routine checkup: about 4 weeks, 2 from week 28, 1 from week 36. */
export function nextCheckupInDays(weeks: number | null): number {
  if (weeks == null || weeks < 28) return 28;
  if (weeks < 36) return 14;
  return 7;
}
