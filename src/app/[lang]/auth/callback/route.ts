import { NextResponse, type NextRequest } from "next/server";
import { RESET_LINK_COOKIE, resetLinkCookieOptions } from "@/lib/auth/reset-link";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

const RESET_PATH = "/reset-password";

// Landing point for links in Supabase emails (password reset).
// Exchanges the one-time code for a session, then continues to `next`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), request.url, RESET_PATH);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(next);
      // Lets /reset-password set a new password for the next 15 minutes.
      if (next.pathname === RESET_PATH && data.user) {
        response.cookies.set(RESET_LINK_COOKIE, data.user.id, resetLinkCookieOptions);
      }
      return response;
    }
  }

  next.searchParams.set("error", "expired");
  return NextResponse.redirect(next);
}

