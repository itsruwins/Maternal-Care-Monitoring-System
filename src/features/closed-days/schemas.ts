import { z } from "zod";
import { parseISODate } from "@/lib/utils/pregnancy";

// Error messages are dictionary keys (closedDays.errors.*).
export const closedDaySchema = z.object({
  date: z.string().trim().refine((value) => parseISODate(value) !== null, "dateInvalid"),
  reason: z.string().trim().min(1, "required").max(120, "tooLong"),
});

export type ClosedDayField = keyof z.input<typeof closedDaySchema>;
