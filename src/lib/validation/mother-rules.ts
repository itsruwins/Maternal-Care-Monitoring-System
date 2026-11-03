import { z } from "@/lib/validation/zod";
import { daysBetween, isPlausibleLmp, parseISODate, todayISO } from "@/lib/utils/pregnancy";

// Rules shared by the mother sign-up and staff registering a mother.
// Error messages are dictionary keys.

/** A mother between 10 and 60 years old. */
export function isPlausibleBirthDate(iso: string, today: string = todayISO()): boolean {
  const days = daysBetween(iso, today);
  return days !== null && days >= 10 * 365 && days <= 60 * 365;
}

/** A due date from 2 weeks ago to about 10 months ahead. */
export function isPlausibleDueDate(iso: string, today: string = todayISO()): boolean {
  const days = daysBetween(today, iso);
  return days !== null && days >= -14 && days <= 300;
}

/** A small whole number typed in a text box (gravida, para). */
export const countField = (message: string, min: number) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,2}$/, message)
    .transform(Number)
    .pipe(z.number().int().min(min, message));

/** Optional LMP: empty, or a real date in the last ~44 weeks. */
export const lmpField = z
  .string()
  .refine((value) => value === "" || (parseISODate(value) !== null && isPlausibleLmp(value)), "lmpInvalid");
