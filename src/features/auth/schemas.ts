import { z } from "zod";
import { daysBetween, isPlausibleLmp, parseISODate, todayISO } from "@/lib/utils/pregnancy";
import { MIN_PASSWORD_LENGTH, MOBILE_PATTERN, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";

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
const count = (message: string, min: number) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,2}$/, message)
    .transform(Number)
    .pipe(z.number().int().min(min, message));

function isPlausibleBirthDate(iso: string): boolean {
  const days = daysBetween(iso, todayISO());
  return days !== null && days >= 10 * 365 && days <= 60 * 365;
}

function isPlausibleDueDate(iso: string): boolean {
  const days = daysBetween(todayISO(), iso);
  return days !== null && days >= -14 && days <= 300;
}

export const registerSchema = z
  .object({
    // Step 1: account
    username: z
      .string()
      .trim()
      .transform((value) => value.toLowerCase())
      .pipe(z.string().regex(USERNAME_PATTERN, "usernameFormat")),
    password: z.string().min(MIN_PASSWORD_LENGTH, "passwordShort"),
    confirmPassword: z.string(),
    email: z
      .string()
      .trim()
      .transform((value) => value.toLowerCase())
      .refine((value) => value === "" || z.email().safeParse(value).success, "emailInvalid"),
    // Step 2: about you
    firstName: required,
    middleName: optionalText,
    lastName: required,
    dateOfBirth: required.refine(isPlausibleBirthDate, "dobInvalid"),
    contactNumber: mobile,
    // Step 3: address
    purok: required,
    street: required,
    emergencyName: required,
    emergencyNumber: mobile,
    // Step 4: pregnancy
    gravida: count("gravidaInvalid", 1),
    para: count("paraInvalid", 0),
    lmp: z.string().refine((value) => value === "" || (parseISODate(value) !== null && isPlausibleLmp(value)), "lmpInvalid"),
    edd: required.refine(isPlausibleDueDate, "eddInvalid"),
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
  { key: "address", fields: ["purok", "street", "emergencyName", "emergencyNumber"] },
  { key: "pregnancy", fields: ["gravida", "para", "lmp", "edd"] },
  { key: "review", fields: [] },
] as const satisfies readonly { key: string; fields: readonly RegisterField[] }[];

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, "required"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(MIN_PASSWORD_LENGTH, "passwordShort"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "passwordMismatch" });
