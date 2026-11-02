import type { Dictionary } from "@/i18n/get-dictionary";
import type { AccountStatus, PregnancyOutcome, PregnancyStatus } from "@/types/database";
import type { Trimester } from "@/lib/utils/pregnancy";

export type MotherStatusFilter = "pregnant" | "notPregnant" | "";

export type MotherFilters = {
  q: string;
  /** A purok id, "none" (no purok yet) or "" (all). */
  purok: number | "none" | "";
  /** Due month "YYYY-MM", "soon" (within 30 days, past due included) or "". */
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

export type PregnancyRecord = {
  id: number;
  gravida: number;
  para: number;
  lmp: string | null;
  edd: string | null;
  status: PregnancyStatus;
  outcome: PregnancyOutcome | null;
  outcomeDate: string | null;
  registrationDate: string;
  remarks: string | null;
};

export type MotherLogin = {
  userId: string;
  username: string;
  status: AccountStatus;
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  email: string | null;
};

export type MotherRecord = {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string;
  purokId: number | null;
  purokName: string | null;
  street: string;
  emergencyName: string;
  emergencyNumber: string;
  registrationDate: string;
  /** The health worker who registered her at the center, if any. */
  registeredBy: string | null;
  /** She signed up on the website herself. */
  selfSignup: boolean;
  current: PregnancyRecord | null;
  past: PregnancyRecord[];
  login: MotherLogin | null;
};

/** Result of a one-click action (reset, activate, …). */
export type MotherActionResult = { ok: true; username?: string } | { ok: false; error: MotherErrorKey };
