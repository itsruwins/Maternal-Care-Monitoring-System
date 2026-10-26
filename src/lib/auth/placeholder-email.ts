// Users without an email still need one for Supabase Auth. They get a hidden
// address on a reserved ".invalid" domain, which can never receive mail.
// Confirmed working with Supabase in Phase 0 (2026-10-26).
export const PLACEHOLDER_EMAIL_DOMAIN = "no-email.taysan-maternacare.invalid";

export function placeholderEmail(username: string): string {
  return `${username.toLowerCase()}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return Boolean(email?.toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`));
}
