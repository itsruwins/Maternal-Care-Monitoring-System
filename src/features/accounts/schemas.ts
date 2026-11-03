import { z } from "@/lib/validation/zod";
import { MAX_LENGTH, MOBILE_PATTERN, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";
import { POSITION_KEYS, POSITION_VALUES, STAFF_ROLES } from "./constants";

// Error messages are dictionary keys (accounts.errors.*).

const required = z.string().trim().min(1, "required");
const mobile = z.string().transform(normalizeMobile).pipe(z.string().regex(MOBILE_PATTERN, "phoneInvalid"));

const staffProfileFields = {
  firstName: required.max(MAX_LENGTH.namePart, "tooLong"),
  middleName: z.string().trim().max(MAX_LENGTH.namePart, "tooLong"),
  lastName: required.max(MAX_LENGTH.namePart, "tooLong"),
  position: z.enum([...POSITION_KEYS, "other"]),
  positionOther: z.string().trim().max(MAX_LENGTH.position, "tooLong"),
  contactNumber: mobile,
};

// "Other" needs a typed position name.
function requireOtherPosition(data: { position: string; positionOther: string }, ctx: z.RefinementCtx) {
  if (data.position === "other" && !data.positionOther) {
    ctx.addIssue({ code: "custom", path: ["positionOther"], message: "required" });
  }
}

export const staffProfileSchema = z.object(staffProfileFields).superRefine(requireOtherPosition);

export const createStaffSchema = z
  .object({
    ...staffProfileFields,
    role: z.enum(STAFF_ROLES),
    username: z
      .string()
      .trim()
      .transform((value) => value.toLowerCase())
      .pipe(z.string().regex(USERNAME_PATTERN, "usernameFormat")),
    email: z
      .string()
      .trim()
      .max(MAX_LENGTH.email, "tooLong")
      .transform((value) => value.toLowerCase())
      .refine((value) => value === "" || z.email().safeParse(value).success, "emailInvalid"),
  })
  .superRefine(requireOtherPosition);

export type StaffProfileInput = z.input<typeof staffProfileSchema>;
export type StaffProfileData = z.output<typeof staffProfileSchema>;
export type CreateStaffData = z.output<typeof createStaffSchema>;

/** The position text to store: the list label, or the typed "Other" name. */
export function positionValue(data: { position: string; positionOther: string }): string {
  return data.position === "other" ? data.positionOther : POSITION_VALUES[data.position as keyof typeof POSITION_VALUES];
}
