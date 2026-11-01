import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireEnv, SUPABASE_URL } from "./env";

// Admin client: BYPASSES RLS. The only file that reads the secret key.
// Use only in server code, only for: username → email lookup at login,
// login lockout, creating staff accounts, resetting passwords (to the default),
// clearing the "must change password" flag, saving a user's own recovery email,
// and the SMS sender (features/sms/server, which has no login of its own).
// Always check the caller's role before using it.
export function createAdminClient() {
  const secretKey = requireEnv(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY");

  return createClient<Database>(SUPABASE_URL, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
