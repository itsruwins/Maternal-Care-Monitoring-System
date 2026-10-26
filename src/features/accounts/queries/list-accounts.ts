import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AccountStatus, UserRole } from "@/types/database";
import { ACCOUNTS_PAGE_SIZE } from "../constants";
import type { AccountFilters, AccountListItem } from "../types";

const ROLES: UserRole[] = ["ADMIN", "HEALTH_WORKER", "MOTHER"];
const STATUSES: AccountStatus[] = ["ACTIVE", "INACTIVE"];

/** Reads ?q=&role=&status=&page= into safe filter values. */
export function parseAccountFilters(params: Record<string, string | string[] | undefined>): AccountFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const role = one("role") as UserRole;
  const status = one("status") as AccountStatus;
  const page = Number.parseInt(one("page"), 10);
  return {
    // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    role: ROLES.includes(role) ? role : "",
    status: STATUSES.includes(status) ? status : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// All accounts, newest first, 20 per page. Search matches the username or the
// staff/mother first or last name. Runs as the logged-in admin (RLS: admins
// can read every account).
export async function listAccounts(filters: AccountFilters): Promise<{ items: AccountListItem[]; total: number }> {
  const supabase = await createClient();
  const like = `%${filters.q}%`;

  let nameMatches: string[] = [];
  if (filters.q) {
    const [staff, mothers] = await Promise.all([
      supabase.from("health_worker").select("user_id").or(`first_name.ilike.${like},last_name.ilike.${like}`),
      supabase.from("mother").select("user_id").not("user_id", "is", null).or(`first_name.ilike.${like},last_name.ilike.${like}`),
    ]);
    nameMatches = [...(staff.data ?? []), ...(mothers.data ?? [])]
      .map((row) => row.user_id)
      .filter((id): id is string => Boolean(id))
      .slice(0, 200);
  }

  const from = (filters.page - 1) * ACCOUNTS_PAGE_SIZE;
  let query = supabase
    .from("user_account")
    .select("user_id, username, role, account_status, created_at, last_login_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ACCOUNTS_PAGE_SIZE - 1);
  if (filters.role) query = query.eq("role", filters.role);
  if (filters.status) query = query.eq("account_status", filters.status);
  if (filters.q) {
    query = query.or(
      nameMatches.length ? `username.ilike.${like},user_id.in.(${nameMatches.join(",")})` : `username.ilike.${like}`,
    );
  }

  const { data: accounts, count, error } = await query;
  if (error || !accounts) return { items: [], total: 0 };

  const ids = accounts.map((a) => a.user_id);
  const [staff, mothers] = ids.length
    ? await Promise.all([
        supabase.from("health_worker").select("user_id, first_name, last_name, position").in("user_id", ids),
        supabase.from("mother").select("user_id, first_name, last_name").in("user_id", ids),
      ])
    : [{ data: [] }, { data: [] }];

  const names = new Map<string, { name: string; position: string | null }>();
  for (const row of staff.data ?? []) {
    names.set(row.user_id, { name: `${row.first_name} ${row.last_name}`.trim(), position: row.position });
  }
  for (const row of mothers.data ?? []) {
    if (row.user_id) names.set(row.user_id, { name: `${row.first_name} ${row.last_name}`.trim(), position: null });
  }

  return {
    total: count ?? 0,
    items: accounts.map((a) => ({
      userId: a.user_id,
      username: a.username,
      role: a.role,
      status: a.account_status,
      createdAt: a.created_at,
      lastLoginAt: a.last_login_at,
      name: names.get(a.user_id)?.name ?? null,
      position: names.get(a.user_id)?.position ?? null,
    })),
  };
}
