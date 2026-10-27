import type { Dictionary } from "@/i18n/get-dictionary";
import type { ClosedDayField } from "./schemas";

export type ClosedDayErrorKey = keyof Dictionary["closedDays"]["errors"];

export type ClosedDay = {
  date: string;
  reason: string;
  /** Appointments still booked (not cancelled) on that day. */
  booked: number;
};

export type ClosedDayFormState = {
  ok?: boolean;
  date?: string;
  error?: ClosedDayErrorKey;
  fieldErrors?: Partial<Record<ClosedDayField, ClosedDayErrorKey>>;
};
