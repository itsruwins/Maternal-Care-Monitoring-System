import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localeFromAcceptLanguage,
  type Locale,
} from "@/i18n/config";
import { CHANGE_PASSWORD_PATH, mustChangePassword } from "@/lib/auth/password-flag";
import { PROTECTED_PREFIXES } from "@/lib/auth/roles";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// Runs before every page request:
// 1. Language: pages live in src/app/[lang]/, but web addresses have no language
//    prefix. We rewrite /register → /en/register (or /fil/register) internally.
// 2. Keeps the Supabase login session fresh.
// 3. Sends logged-out visitors away from protected areas, and people still on a
//    default password to /change-password (quick checks only; the real checks
//    are requireRole() on the server).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  // A shared link like /fil/register: remember Filipino, show /register.
  if (isLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(firstSegment.length + 1) || "/";
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  const locale = resolveLocale(request);

  const refreshedCookies: { name: string; value: string; options: CookieOptions }[] = [];
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        refreshedCookies.push(...cookiesToSet);
        cacheHeaders = headers;
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);
  const needsNewPassword = isLoggedIn && mustChangePassword(data?.claims?.app_metadata);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  let response: NextResponse;
  const needsLogin = isProtected || pathname === CHANGE_PASSWORD_PATH;

  if (needsLogin && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    response = NextResponse.redirect(url);
  } else if (isProtected && needsNewPassword) {
    const url = request.nextUrl.clone();
    url.pathname = CHANGE_PASSWORD_PATH;
    url.search = "";
    response = NextResponse.redirect(url);
  } else {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    response = NextResponse.rewrite(url, { request });
  }

  for (const { name, value, options } of refreshedCookies) {
    response.cookies.set(name, value, options);
  }
  for (const [key, value] of Object.entries(cacheHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

function resolveLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage(request.headers.get("accept-language"));
}

export const config = {
  matcher: [
    // Everything except API routes, Next.js internals and static files.
    "/((?!api|_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)",
  ],
};
