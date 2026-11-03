import { z } from "@/lib/validation/zod";
import { SERVICE_ICONS } from "@/lib/appointments/service-icons";

// Error messages are dictionary keys (activityTypes.errors.*).
export const MAX_REMINDER_DAYS = 30;

export const activityTypeSchema = z.object({
  name: z.string().trim().min(1, "required").max(80, "tooLong"),
  description: z.string().trim().max(300, "tooLong"),
  reminderDaysBefore: z
    .string()
    .trim()
    .regex(/^\d{1,2}$/, "daysInvalid")
    .transform(Number)
    .pipe(z.number().int().min(0, "daysInvalid").max(MAX_REMINDER_DAYS, "daysInvalid")),
  icon: z.enum(SERVICE_ICONS, "required"),
});

export type ActivityTypeField = keyof z.input<typeof activityTypeSchema>;
