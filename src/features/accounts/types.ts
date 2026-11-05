import type { Dictionary } from "@/i18n/get-dictionary";
import type { AccountStatus, UserRole } from "@/types/database";

export type AccountErrorKey = keyof Dictionary["accounts"]["errors"];

export type StaffField = "firstName" | "middleName" | "lastName" | "position" | "positionOther" | "contactNumber";
export type CreateStaffField = StaffField | "username" | "email" | "role";

export type FormState<Field extends string> = {
  ok?: boolean;
  error?: AccountErrorKey;
  fieldErrors?: Partial<Record<Field, AccountErrorKey>>;
  /** The username of a new account (shown as the temporary password). */
  username?: string;
};

export type ActionResult = { ok: true; username?: string } | { ok: false; error: AccountErrorKey };

export type AccountListItem = {
  userId: string;
  username: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
  name: string | null;
  position: string | null;
};

export type AccountFilters = {
  q: string;
  role: UserRole | "";
  /** An account status, or NEVER: never logged in (any status). */
  status: AccountStatus | "NEVER" | "";
  page: number;
};

/** The four counts over the list (every account, no filters). */
export type AccountCounts = { active: number; mothers: number; never: number; inactive: number };

/** The role tabs' counts (with the search and status applied). */
export type AccountTabCounts = Record<UserRole | "all", number>;
