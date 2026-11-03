import { z } from "@/lib/validation/zod";
import { purokIdField } from "@/lib/puroks/purok-field";
import { MAX_LENGTH, MIN_PASSWORD_LENGTH, MOBILE_PATTERN, normalizeMobile } from "@/lib/validation/account-rules";

// Error messages are dictionary keys (profile.errors.*).

const required = z.string().trim().min(1, "required");
const optional = z.string().trim();
const mobile = z.string().transform(normalizeMobile).pipe(z.string().regex(MOBILE_PATTERN, "phoneInvalid"));

export const staffDetailsSchema = z.object({
  firstName: required.max(MAX_LENGTH.namePart, "tooLong"),
  middleName: optional.max(MAX_LENGTH.namePart, "tooLong"),
  lastName: required.max(MAX_LENGTH.namePart, "tooLong"),
  contactNumber: mobile,
});

export const motherDetailsSchema = staffDetailsSchema.extend({
  purokId: purokIdField,
  street: required.max(MAX_LENGTH.street, "tooLong"),
  emergencyName: required.max(MAX_LENGTH.fullName, "tooLong"),
  emergencyNumber: mobile,
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "required"),
    password: z.string().min(MIN_PASSWORD_LENGTH, "passwordShort").max(MAX_LENGTH.password, "passwordLong"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "passwordMismatch" });

export const recoveryEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .max(MAX_LENGTH.email, "emailInvalid")
    .transform((value) => value.toLowerCase())
    .pipe(z.email("emailInvalid")),
});

export type DetailsField = keyof z.input<typeof motherDetailsSchema>;
export type PasswordField = keyof z.input<typeof changePasswordSchema>;
