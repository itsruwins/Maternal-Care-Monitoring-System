import type { MotherErrorKey } from "./types";

/** Zod issues → { field: dictionary key }, first error per field. */
export function fieldErrorsOf<Field extends string>(issues: { path: PropertyKey[]; message: string }[]): Partial<Record<Field, MotherErrorKey>> {
  const errors: Partial<Record<Field, MotherErrorKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= issue.message as MotherErrorKey;
  }
  return errors;
}

/** Reads the named fields of a form as strings. */
export function readFields<Field extends string>(formData: FormData, fields: readonly Field[]): Record<Field, string> {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")])) as Record<Field, string>;
}
