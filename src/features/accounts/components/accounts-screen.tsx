import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { getAccountsPage, parseAccountFilters } from "../queries/list-accounts";
import { AccountsView } from "./accounts-view";

// /admin/accounts?q=&role=&status=&page=: the counts, the role tabs, then the
// list in its filter card. Reads the session and the address: render inside
// <Suspense>.
export async function AccountsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(["ADMIN"]);
  const { t, locale } = await getServerI18n();
  const filters = parseAccountFilters(await searchParams);
  const { items, total, tabs, counts } = await getAccountsPage(filters);
  return <AccountsView t={t} locale={locale} items={items} total={total} tabs={tabs} counts={counts} filters={filters} today={manilaTodayISO()} />;
}
