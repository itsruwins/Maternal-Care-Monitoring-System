import { z } from "@/lib/validation/zod";
import { purokIdField } from "@/lib/puroks/purok-field";
import { countField, isPlausibleBirthDate, isPlausibleDueDate, lmpField } from "@/lib/validation/mother-rules";
import { MAX_LENGTH, MIN_PASSWORD_LENGTH, MOBILE_PATTERN, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";

// Error messages are dictionary keys, translated in the UI:
// auth.errors.* for login, register.errors.* for sign-up, reset.errors.* for passwords.

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "usernameRequired")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "passwordRequired"),
});

export type LoginInput = z.input<typeof loginSchema>;

// Shared rules live in lib so other features can use them too.
export { MIN_PASSWORD_LENGTH, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";

const required = z.string().trim().min(1, "required");
const optionalText = z.string().trim();
const mobile = z
  .string()
  .transform(normalizeMobile)
  .pipe(z.string().regex(MOBILE_PATTERN, "phoneInvalid"));

export const registerSchema = z
  .object({
    // Step 1: account
    username: z
      .string()
      .trim()
      .transform((value) => value.toLowerCase())
      .pipe(z.string().regex(USERNAME_PATTERN, "usernameFormat")),
    password: z.string().min(MIN_PASSWORD_LENGTH, "passwordShort").max(MAX_LENGTH.password, "passwordLong"),
    confirmPassword: z.string(),
    email: z
      .string()
      .trim()
      .max(MAX_LENGTH.email, "tooLong")
      .transform((value) => value.toLowerCase())
      .refine((value) => value === "" || z.email().safeParse(value).success, "emailInvalid"),
    // Step 2: about you
    firstName: required.max(MAX_LENGTH.namePart, "tooLong"),
    middleName: optionalText.max(MAX_LENGTH.namePart, "tooLong"),
    lastName: required.max(MAX_LENGTH.namePart, "tooLong"),
    dateOfBirth: required.refine((value) => isPlausibleBirthDate(value), "dobInvalid"),
    contactNumber: mobile,
    // Step 3: address
    purokId: purokIdField,
    street: required.max(MAX_LENGTH.street, "tooLong"),
    emergencyName: required.max(MAX_LENGTH.fullName, "tooLong"),
    emergencyNumber: mobile,
    // Step 4: pregnancy
    gravida: countField("gravidaInvalid", 1),
    para: countField("paraInvalid", 0),
    lmp: lmpField,
    edd: required.refine((value) => isPlausibleDueDate(value), "eddInvalid"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "passwordMismatch" });
    }
    // Past births can't include the current pregnancy.
    if (data.para > data.gravida - 1) {
      ctx.addIssue({ code: "custom", path: ["para"], message: "paraTooHigh" });
    }
  });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterData = z.output<typeof registerSchema>;
export type RegisterField = keyof RegisterInput;

// Which fields each step of the sign-up form validates.
export const REGISTER_STEPS = [
  { key: "account", fields: ["username", "password", "confirmPassword", "email"] },
  { key: "personal", fields: ["firstName", "middleName", "lastName", "dateOfBirth", "contactNumber"] },
  { key: "address", fields: ["purokId", "street", "emergencyName", "emergencyNumber"] },
  { key: "pregnancy", fields: ["gravida", "para", "lmp", "edd"] },
  { key: "review", fields: [] },
] as const satisfies readonly { key: string; fields: readonly RegisterField[] }[];

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "required").max(MAX_LENGTH.email, "tooLong"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(MIN_PASSWORD_LENGTH, "passwordShort").max(MAX_LENGTH.password, "passwordLong"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "passwordMismatch" });
