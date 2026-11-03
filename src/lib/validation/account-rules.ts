// Account rules shared by every feature (sign-up, staff accounts, profiles).

// Usernames for new accounts and renames: 8-30 characters (migration 0002 format
// + 0007 minimum), so a username is always a valid default password. Login still
// accepts older, shorter usernames.
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._]{6,28}[a-z0-9]$/;
export const MIN_PASSWORD_LENGTH = 8;

/** Longest values the forms accept (Supabase Auth refuses passwords over 72). */
export const MAX_LENGTH = {
  namePart: 60, // first, middle or last name
  fullName: 120, // emergency contact
  street: 150,
  position: 60, // "Other" position
  email: 254,
  password: 72,
} as const;

const INPUT_MAX_LENGTH: Partial<Record<string, number>> = {
  firstName: MAX_LENGTH.namePart,
  middleName: MAX_LENGTH.namePart,
  lastName: MAX_LENGTH.namePart,
  emergencyName: MAX_LENGTH.fullName,
  street: MAX_LENGTH.street,
  positionOther: MAX_LENGTH.position,
  email: MAX_LENGTH.email,
  password: MAX_LENGTH.password,
  confirm: MAX_LENGTH.password,
  confirmPassword: MAX_LENGTH.password,
};

/** The input's maxLength for a form field (the same limits as the schemas), if it has one. */
export function inputMaxLength(field: string): number | undefined {
  return INPUT_MAX_LENGTH[field];
}

/** Philippine mobile number after normalizeMobile: 11 digits starting with 09. */
export const MOBILE_PATTERN = /^09\d{9}$/;

/** "0917 123-4567" / "+63 917 123 4567" → "09171234567" */
export function normalizeMobile(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+63")) return `0${digits.slice(3)}`;
  if (digits.startsWith("63") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}
