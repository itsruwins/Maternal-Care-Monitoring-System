// "Must change password": set (with the secret key, on the server) when an
// admin creates a staff account or someone's password is reset to the
// default (their username). Stored in the login's protected app_metadata,
// which users can't edit, and carried in the session token.

export const MUST_CHANGE_PASSWORD_KEY = "must_change_password";
export const CHANGE_PASSWORD_PATH = "/change-password";

/** True when the session token (or a user's app_metadata) says a new password is required. */
export function mustChangePassword(appMetadata: unknown): boolean {
  return (
    typeof appMetadata === "object" &&
    appMetadata !== null &&
    (appMetadata as Record<string, unknown>)[MUST_CHANGE_PASSWORD_KEY] === true
  );
}
