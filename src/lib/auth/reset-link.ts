import "server-only";
import { cookies } from "next/headers";

// "Opened a password-reset link": /auth/callback sets this short-lived,
// httpOnly cookie (holding the login's id) after a reset link signs someone
// in. The /reset-password form only works while it matches the logged-in
// user, so an ordinary session can't set a new password there without the
// current one (that's the Profile page's job).

export const RESET_LINK_COOKIE = "reset_link";
const RESET_LINK_MINUTES = 15;

export const resetLinkCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: RESET_LINK_MINUTES * 60,
} as const;

/** True while the logged-in user came in through a reset link in the last 15 minutes. */
export async function openedResetLink(userId: string): Promise<boolean> {
  return (await cookies()).get(RESET_LINK_COOKIE)?.value === userId;
}

export async function clearResetLink(): Promise<void> {
  (await cookies()).delete(RESET_LINK_COOKIE);
}
