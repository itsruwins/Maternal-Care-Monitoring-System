"use server";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { activityTypeSchema, type ActivityTypeField } from "../schemas";
import type { ActivityTypeErrorKey, ActivityTypeFormState } from "../types";

const FIELDS: ActivityTypeField[] = ["name", "description", "reminderDaysBefore"];

// Admin adds (id = null) or edits an activity type. No delete: past
// appointments and visits point to these rows.
export async function saveActivityType(
  id: number | null,
  _previous: ActivityTypeFormState,
  formData: FormData,
): Promise<ActivityTypeFormState> {
  await requireRole(["ADMIN"]);

  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = activityTypeSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ActivityTypeFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ActivityTypeField;
      fieldErrors[field] ??= issue.message as ActivityTypeErrorKey;
    }
    return { fieldErrors };
  }

  const values = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    reminder_days_before: parsed.data.reminderDaysBefore,
  };
  const supabase = await createClient();
  const { error } =
    id === null
      ? await supabase.from("activity_type").insert(values)
      : await supabase.from("activity_type").update(values).eq("activity_type_id", id);

  if (error) {
    return error.code === "23505" ? { fieldErrors: { name: "nameTaken" } } : { error: "generic" };
  }
  return { ok: true };
}
