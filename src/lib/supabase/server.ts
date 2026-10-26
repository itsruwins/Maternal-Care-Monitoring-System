import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "@/types/database";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

// Supabase client for Server Components, Server Actions and Route Handlers.
// Acts as the logged-in user (RLS applies).
export async function createClient() {
  // Everything done with this client is per-request: Supabase checks the login
  // token's expiry with the current time (Date.now()), which Next.js (Cache
  // Components) only allows after connection(). Without it, logged-in pages
  // fail with "unstable value Date.now() while prerendering".
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
