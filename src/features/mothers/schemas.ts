import { z } from "zod";
import { purokIdField } from "@/lib/puroks/purok-field";
import { MOBILE_PATTERN, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { parseISODate } from "@/lib/utils/pregnancy";
import { countField, isPlausibleBirthDate, isPlausibleDueDate, lmpField } from "@/lib/validation/mother-rules";

// Error messages are dictionary keys (mothers.errors.*).

const required = z.string().trim().min(1, "required");
const mobile = z.string().transform(normalizeMobile).pipe(z.string().regex(MOBILE_PATTERN, "phoneInvalid"));

/** Optional login fields: a username (also the temporary password) and email. */
const loginFields = {
  username: z.string().trim().transform((value) => value.toLowerCase()),
  email: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine((value) => value === "" || z.email().safeParse(value).success, "emailInvalid"),
};

export const loginSchema = z.object(loginFields).superRefine((data, ctx) => {
  if (!USERNAME_PATTERN.test(data.username)) {
    ctx.addIssue({ code: "custom", path: ["username"], message: "usernameFormat" });
  }
});

// A mother registered at the health center, with her current pregnancy and,
// if ticked, a login.
export const registerMotherSchema = z
  .object({
    firstName: required,
    middleName: z.string().trim(),
    lastName: required,
    dateOfBirth: required.refine((value) => isPlausibleBirthDate(value), "dobInvalid"),
    contactNumber: mobile,
    purokId: purokIdField,
    street: required,
    emergencyName: required,
    emergencyNumber: mobile,
    gravida: countField("gravidaInvalid", 1),
    para: countField("paraInvalid", 0),
    lmp: lmpField,
    edd: required.refine((value) => isPlausibleDueDate(value), "eddInvalid"),
    createLogin: z.string().transform((value) => value === "on"),
    ...loginFields,
  })
  .superRefine((data, ctx) => {
    // Past births can't include the current pregnancy.
    if (data.para > data.gravida - 1) {
      ctx.addIssue({ code: "custom", path: ["para"], message: "paraTooHigh" });
    }
    if (data.createLogin && !USERNAME_PATTERN.test(data.username)) {
      ctx.addIssue({ code: "custom", path: ["username"], message: "usernameFormat" });
    }
  });

export type RegisterMotherField = keyof z.input<typeof registerMotherSchema>;
export type RegisterMotherData = z.output<typeof registerMotherSchema>;
export type LoginField = keyof z.input<typeof loginSchema>;

// --- Her record (staff editing) ---------------------------------------------

export const motherDetailsSchema = z.object({
  firstName: required,
  middleName: z.string().trim(),
  lastName: required,
  dateOfBirth: required.refine((value) => isPlausibleBirthDate(value), "dobInvalid"),
  contactNumber: mobile,
  purokId: purokIdField,
  street: required,
  emergencyName: required,
  emergencyNumber: mobile,
});

export type MotherDetailsField = keyof z.input<typeof motherDetailsSchema>;

// --- Pregnancies ---------------------------------------------------------------

export const OUTCOMES = ["LIVE_BIRTH", "STILLBIRTH", "MISCARRIAGE", "OTHER"] as const;
const remarks = z.string().trim().max(300, "tooLong");
const pastDate = (message: string) =>
  required.refine((value) => parseISODate(value) !== null && value <= manilaTodayISO(), message);
const optionalDate = z.string().trim().refine((value) => value === "" || parseISODate(value) !== null, "dateInvalid");

/** The current pregnancy (start a new one, or edit it). */
export const currentPregnancySchema = z
  .object({
    gravida: countField("gravidaInvalid", 1),
    para: countField("paraInvalid", 0),
    lmp: lmpField,
    edd: required.refine((value) => isPlausibleDueDate(value), "eddInvalid"),
    remarks,
  })
  .superRefine((data, ctx) => {
    if (data.para > data.gravida - 1) ctx.addIssue({ code: "custom", path: ["para"], message: "paraTooHigh" });
  });

/** How the current pregnancy ended. */
export const closePregnancySchema = z.object({
  outcome: z.enum(OUTCOMES, "required"),
  outcomeDate: pastDate("outcomeDateInvalid"),
  remarks,
});

/** A pregnancy that ended before (G/P as they were then; dates optional except the outcome date). */
export const pastPregnancySchema = z
  .object({
    gravida: countField("gravidaInvalid", 1),
    para: countField("paraInvalid", 0),
    outcome: z.enum(OUTCOMES, "required"),
    outcomeDate: pastDate("outcomeDateInvalid"),
    lmp: optionalDate,
    edd: optionalDate,
    remarks,
  })
  .superRefine((data, ctx) => {
    if (data.para > data.gravida) ctx.addIssue({ code: "custom", path: ["para"], message: "paraOverGravida" });
    if (data.lmp && data.lmp > data.outcomeDate) ctx.addIssue({ code: "custom", path: ["outcomeDate"], message: "outcomeBeforeLmp" });
  });

export type CurrentPregnancyField = keyof z.input<typeof currentPregnancySchema>;
export type ClosePregnancyField = keyof z.input<typeof closePregnancySchema>;
export type PastPregnancyField = keyof z.input<typeof pastPregnancySchema>;

/** DELIVERED for births, ENDED otherwise. */
export function statusForOutcome(outcome: (typeof OUTCOMES)[number]): "DELIVERED" | "ENDED" {
  return outcome === "LIVE_BIRTH" || outcome === "STILLBIRTH" ? "DELIVERED" : "ENDED";
}
