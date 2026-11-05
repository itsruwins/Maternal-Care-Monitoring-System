import type { AccountFilters } from "./types";

// Addresses inside the accounts area (plain functions: usable on the server
// and in the browser).

export const ACCOUNTS_PATH = "/admin/accounts";

export const NO_ACCOUNT_FILTERS: AccountFilters = { q: "", role: "", status: "", page: 1 };

/** The list with these filters, relative to the page ("?role=MOTHER"); back to page 1 unless a page is given. */
export function accountsHref(filters: AccountFilters, changes: Partial<AccountFilters> = {}): string {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.role) params.set("role", next.role);
  if (next.status) params.set("status", next.status);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `?${query}` : "?";
}

/** One account's page. */
export const accountHref = (userId: string) => `${ACCOUNTS_PATH}/${userId}`;
