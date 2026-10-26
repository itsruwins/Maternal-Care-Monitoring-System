// Staff positions: a fixed list plus "Other" (typed in). The English label is
// what's stored in health_worker.position; the UI shows the translated label.
export const POSITION_KEYS = ["midwife", "nurse", "bhw", "bns", "admin"] as const;
export type PositionKey = (typeof POSITION_KEYS)[number];

export const POSITION_VALUES: Record<PositionKey, string> = {
  midwife: "Midwife",
  nurse: "Nurse",
  bhw: "Barangay Health Worker (BHW)",
  bns: "Barangay Nutrition Scholar (BNS)",
  admin: "Admin staff",
};

/** The list key for a stored position, or "other" for anything typed in. */
export function positionKeyOf(value: string | null | undefined): PositionKey | "other" {
  const found = POSITION_KEYS.find((key) => POSITION_VALUES[key] === value);
  return found ?? "other";
}

export const ACCOUNTS_PAGE_SIZE = 20;
export const STAFF_ROLES = ["HEALTH_WORKER", "ADMIN"] as const;
