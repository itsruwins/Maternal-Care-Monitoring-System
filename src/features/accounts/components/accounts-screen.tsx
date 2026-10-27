import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { listAccounts, parseAccountFilters } from "../queries/list-accounts";
import { AccountsView } from "./accounts-view";

// /admin/accounts: title + "New staff account", filters, then the list.
// Reads the session and the address: render inside <Suspense>.
export async function AccountsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(["ADMIN"]);
  const { t, locale } = await getServerI18n();
  const filters = parseAccountFilters(await searchParams);
  const { items, total } = await listAccounts(filters);
  return <AccountsView t={t} locale={locale} items={items} total={total} filters={filters} />;
}
