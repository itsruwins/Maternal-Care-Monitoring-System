import "server-only";
import { mustChangePassword } from "@/lib/auth/password-flag";
import { isPlaceholderEmail } from "@/lib/auth/placeholder-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AccountStatus, UserRole } from "@/types/database";

export type AccountDetail = {
  userId: string;
  username: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
  /** Real recovery email, or null (none / placeholder). */
  email: string | null;
  /** Still using a default password (new account or after a reset). */
  mustChangePassword: boolean;
  staff: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    position: string;
    contactNumber: string;
  } | null;
  mother: { firstName: string; lastName: string; contactNumber: string; purok: string | null } | null;
};

// One account with its staff profile or mother record. The caller must be an
// admin (checked by the page); the login email is read with the secret key.
export async function getAccount(userId: string): Promise<AccountDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const supabase = await createClient();

  const [{ data: account }, { data: staff }, { data: mother }] = await Promise.all([
    supabase
      .from("user_account")
      .select("user_id, username, role, account_status, created_at, last_login_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("health_worker")
      .select("first_name, middle_name, last_name, position, contact_number")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("mother")
      .select("first_name, last_name, contact_number, purok:purok_id(name)")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (!account) return null;

  const { data: auth } = await createAdminClient().auth.admin.getUserById(userId);
  const email = auth.user?.email ?? null;

  return {
    userId: account.user_id,
    username: account.username,
    role: account.role,
    status: account.account_status,
    createdAt: account.created_at,
    lastLoginAt: account.last_login_at,
    email: email && !isPlaceholderEmail(email) ? email : null,
    mustChangePassword: mustChangePassword(auth.user?.app_metadata),
    staff: staff
      ? {
          firstName: staff.first_name,
          middleName: staff.middle_name,
          lastName: staff.last_name,
          position: staff.position,
          contactNumber: staff.contact_number,
        }
      : null,
    mother: mother
      ? {
          firstName: mother.first_name,
          lastName: mother.last_name,
          contactNumber: mother.contact_number,
          purok: mother.purok?.name ?? null,
        }
      : null,
  };
}
