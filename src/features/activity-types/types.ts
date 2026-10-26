import type { Dictionary } from "@/i18n/get-dictionary";
import type { ActivityTypeField } from "./schemas";

export type ActivityTypeErrorKey = keyof Dictionary["activityTypes"]["errors"];

export type ActivityType = {
  id: number;
  name: string;
  description: string | null;
  reminderDaysBefore: number;
};

export type ActivityTypeFormState = {
  ok?: boolean;
  error?: ActivityTypeErrorKey;
  fieldErrors?: Partial<Record<ActivityTypeField, ActivityTypeErrorKey>>;
};
