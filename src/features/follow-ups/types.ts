import type { Dictionary } from "@/i18n/get-dictionary";
import type { FollowUpCloseReason, FollowUpEnding, FollowUpMethod, FollowUpResult } from "@/types/database";
import type { FollowUpField } from "./schemas";

export type FollowUpTab = "open" | "closed";

export type FollowUpFilters = {
  tab: FollowUpTab;
  q: string;
  purok: number | "none" | "";
  from: string;
  to: string;
  /** "no": not contacted yet; "yes": tried already. */
  tried: "no" | "yes" | "";
  page: number;
};

/** How many missed visits each tab holds (search and filters applied). */
export type FollowUpTabCounts = Record<FollowUpTab, number>;

/** The counts above the Follow-ups page (no filters). */
export type FollowUpHubCounts = {
  /** Still to follow up. */
  open: number;
  /** Open, with no try logged yet. */
  notContacted: number;
  /** Open, missed more than 7 days ago. */
  overWeek: number;
  /** Sorted out since Sunday. */
  sortedThisWeek: number;
};

/** One logged try to reach her. */
export type FollowUpEntry = {
  id: number;
  date: string;
  method: FollowUpMethod;
  /** Empty for entries logged before Phase 6. */
  result: FollowUpResult | null;
  notes: string;
  closeReason: FollowUpCloseReason | null;
  loggedBy: string;
  /** Health workers: only on the day it was logged. Admins: always. */
  canEdit: boolean;
};

/** One missed appointment on the follow-up list. */
export type FollowUpItem = {
  appointmentId: number;
  serviceId: number;
  service: string;
  missedAt: string;
  /** Manila date of the missed visit (follow-ups can't be dated before it). */
  missedDate: string;
  daysAgo: number;
  mother: { id: number; name: string; contactNumber: string; purok: string | null };
  isOpen: boolean;
  ending: { how: FollowUpEnding; at: string | null; closeReason: FollowUpCloseReason | null; rebookedAt: string | null } | null;
  /** Newest first. */
  entries: FollowUpEntry[];
};

export type FollowUpErrorKey = keyof Dictionary["followUpErrors"];

export type FollowUpActionResult =
  | { ok: true }
  | { ok: false; error?: FollowUpErrorKey; fieldErrors?: Partial<Record<FollowUpField, FollowUpErrorKey>> };
