// Server Actions can be called with any arguments, not only what our forms
// send, so every action checks the ids it is given before using them.

/** A database id: a positive whole number. */
export function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/** An id, or null where "none" is allowed (e.g. adding instead of editing). */
export function isIdOrNull(value: unknown): value is number | null {
  return value === null || isId(value);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A login's id (Supabase Auth user id). */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** Plain text from an action argument; anything else counts as empty. */
export function textArg(value: unknown): string {
  return typeof value === "string" ? value : "";
}
