import { z } from "zod";
import { purokIdField } from "@/lib/puroks/purok-field";
import { MOBILE_PATTERN, normalizeMobile, USERNAME_PATTERN } from "@/lib/validation/account-rules";
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
