// Account rules shared by every feature (sign-up, staff accounts, profiles).

// Usernames for new accounts and renames: 8-30 characters (migration 0002 format
// + 0007 minimum), so a username is always a valid default password. Login still
// accepts older, shorter usernames.
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._]{6,28}[a-z0-9]$/;
export const MIN_PASSWORD_LENGTH = 8;

/** Philippine mobile number after normalizeMobile: 11 digits starting with 09. */
export const MOBILE_PATTERN = /^09\d{9}$/;

/** "0917 123-4567" / "+63 917 123 4567" → "09171234567" */
export function normalizeMobile(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+63")) return `0${digits.slice(3)}`;
  if (digits.startsWith("63") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}
