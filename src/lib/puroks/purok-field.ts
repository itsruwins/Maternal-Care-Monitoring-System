import { z } from "@/lib/validation/zod";

// A purok picked from the list: the select sends its id as text. The error
// message is a dictionary key ("required" in every form's errors).
export const purokIdField = z
  .string()
  .trim()
  .regex(/^[1-9]\d{0,9}$/, "required")
  .transform(Number);
