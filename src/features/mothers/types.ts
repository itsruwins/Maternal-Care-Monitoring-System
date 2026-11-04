import type { Dictionary } from "@/i18n/get-dictionary";
import type {
  AccountStatus,
  AppointmentStatus,
  FollowUpMethod,
  FollowUpResult,
  PregnancyOutcome,
  PregnancyStatus,
  ReminderType,
  SmsDeliveryStatus,
} from "@/types/database";
import type { Trimester } from "@/lib/utils/pregnancy";

/** The list's tabs: everyone (""), pregnant now, due within 30 days (past due included), not pregnant now. */
export type MotherStatusFilter = "pregnant" | "dueSoon" | "notPregnant" | "";

/** List order: by name or by due date, "-" for the reverse. */
export type MotherSort = "name" | "-name" | "due" | "-due";

export type MotherFilters = {
  q: string;
  /** A purok id, "none" (no purok yet) or "" (all). */
  purok: number | "none" | "";
  /** Due month "YYYY-MM" or "" (only current pregnancies have one). */
  due: string;
  status: MotherStatusFilter;
  sort: MotherSort;
  page: number;
};

/** How many mothers each tab holds, with the search and purok applied. */
export type MotherTabCounts = Record<"all" | "pregnant" | "dueSoon" | "notPregnant", number>;

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

/** One thing that happened on her record, for the Overview's recent activity. */
export type MotherEvent =
  | { kind: "visit"; id: string; at: string; weeks: number; services: string[] }
  /** at: when it happened (asked, booked, cancelled; the visit time when missed). */
  | { kind: "appointment"; id: string; at: string; status: AppointmentStatus; service: string; visitAt: string }
  | { kind: "text"; id: string; at: string; type: ReminderType; status: SmsDeliveryStatus }
  | { kind: "followUp"; id: string; at: string; method: FollowUpMethod; result: FollowUpResult | null };

/** The record header's next and last visit, and her latest events (newest first). */
export type MotherActivity = {
  next: { at: string; service: string; status: AppointmentStatus } | null;
  last: { at: string; weeks: number; services: string[] } | null;
  events: MotherEvent[];
};
