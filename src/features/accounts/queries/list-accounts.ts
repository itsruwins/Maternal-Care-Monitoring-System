import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AccountStatus, UserRole } from "@/types/database";
import { ACCOUNTS_PAGE_SIZE } from "../constants";
import type { AccountCounts, AccountFilters, AccountListItem, AccountTabCounts } from "../types";

const ROLES: UserRole[] = ["ADMIN", "HEALTH_WORKER", "MOTHER"];
const STATUSES: (AccountStatus | "NEVER")[] = ["ACTIVE", "INACTIVE", "NEVER"];

type Client = Awaited<ReturnType<typeof createClient>>;

/** Reads ?q=&role=&status=&page= into safe filter values. */
export function parseAccountFilters(params: Record<string, string | string[] | undefined>): AccountFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const role = one("role") as UserRole;
  const status = one("status") as AccountStatus | "NEVER";
  const page = Number.parseInt(one("page"), 10);
  return {
    // Keep letters, numbers, spaces, dots, underscores and dashes (safe in filters).
    q: one("q").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60),
    role: ROLES.includes(role) ? role : "",
    status: STATUSES.includes(status) ? status : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** The accounts whose staff or mother first or last name matches the search (at most 200). */
async function nameMatches(supabase: Client, q: string): Promise<string[]> {
  if (!q) return [];
  const like = `%${q}%`;
  const [staff, mothers] = await Promise.all([
    supabase.from("health_worker").select("user_id").or(`first_name.ilike.${like},last_name.ilike.${like}`),
    supabase.from("mother").select("user_id").not("user_id", "is", null).or(`first_name.ilike.${like},last_name.ilike.${like}`),
  ]);
  return [...(staff.data ?? []), ...(mothers.data ?? [])]
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id))
    .slice(0, 200);
}

type Filterable = {
  eq(column: string, value: unknown): Filterable;
  is(column: string, value: null): Filterable;
  or(filters: string): Filterable;
};

/** The search and status (and the role, unless left out) on a user_account query. */
function filtered<Q>(query: Q, filters: AccountFilters, matches: string[], { role = true }: { role?: boolean } = {}): Q {
  let q = query as unknown as Filterable;
  if (role && filters.role) q = q.eq("role", filters.role);
  if (filters.status === "NEVER") q = q.is("last_login_at", null);
  else if (filters.status) q = q.eq("account_status", filters.status);
  if (filters.q) {
    const like = `%${filters.q}%`;
    q = q.or(matches.length ? `username.ilike.${like},user_id.in.(${matches.join(",")})` : `username.ilike.${like}`);
  }
  return q as unknown as Q;
}

// The accounts page's data: one page of accounts (newest first, 20 a page),
// how many match, the role tabs' counts (search and status applied) and the
// four counts over every account. Search matches the username or the staff or
// mother first or last name. Runs as the logged-in admin (RLS: admins can
// read every account).
export async function getAccountsPage(filters: AccountFilters): Promise<{
  items: AccountListItem[];
  total: number;
  tabs: AccountTabCounts;
  counts: AccountCounts;
}> {
  const supabase = await createClient();
  const matches = await nameMatches(supabase, filters.q);
  const head = () => supabase.from("user_account").select("user_id", { count: "exact", head: true });
  const tally = async (query: PromiseLike<{ count: number | null }>) => (await query).count ?? 0;

  const from = (filters.page - 1) * ACCOUNTS_PAGE_SIZE;
  const [page, all, healthWorkers, admins, mothers, active, mothersAll, never, inactive] = await Promise.all([
    filtered(
      supabase
        .from("user_account")
        .select("user_id, username, role, account_status, created_at, last_login_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .order("user_id")
        .range(from, from + ACCOUNTS_PAGE_SIZE - 1),
      filters,
      matches,
    ),
    tally(filtered(head(), filters, matches, { role: false })),
    tally(filtered(head().eq("role", "HEALTH_WORKER"), filters, matches, { role: false })),
    tally(filtered(head().eq("role", "ADMIN"), filters, matches, { role: false })),
    tally(filtered(head().eq("role", "MOTHER"), filters, matches, { role: false })),
    tally(head().eq("account_status", "ACTIVE")),
    tally(head().eq("role", "MOTHER")),
    tally(head().is("last_login_at", null)),
    tally(head().eq("account_status", "INACTIVE")),
  ]);

  const tabs: AccountTabCounts = { all, HEALTH_WORKER: healthWorkers, ADMIN: admins, MOTHER: mothers };
  const counts: AccountCounts = { active, mothers: mothersAll, never, inactive };
  const { data: accounts, count, error } = page;
  if (error || !accounts) return { items: [], total: 0, tabs, counts };

  const ids = accounts.map((a) => a.user_id);
  const [staff, mothersNamed] = ids.length
    ? await Promise.all([
        supabase.from("health_worker").select("user_id, first_name, last_name, position").in("user_id", ids),
        supabase.from("mother").select("user_id, first_name, last_name").in("user_id", ids),
      ])
    : [{ data: [] }, { data: [] }];

  const names = new Map<string, { name: string; position: string | null }>();
  for (const row of staff.data ?? []) {
    names.set(row.user_id, { name: `${row.first_name} ${row.last_name}`.trim(), position: row.position });
  }
  for (const row of mothersNamed.data ?? []) {
    if (row.user_id) names.set(row.user_id, { name: `${row.first_name} ${row.last_name}`.trim(), position: null });
  }

  return {
    total: count ?? 0,
    tabs,
    counts,
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
