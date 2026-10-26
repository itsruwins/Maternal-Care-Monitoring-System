import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { listAccounts, parseAccountFilters } from "../queries/list-accounts";
import { AccountFiltersForm } from "./account-filters";
import { AccountsList } from "./accounts-list";
import { CreateStaffDialog } from "./create-staff-dialog";

// /admin/accounts: title + "New staff account", filters, then the list.
// Reads the session and the address: render inside <Suspense>.
export async function AccountsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(["ADMIN"]);
  const { t, locale } = await getServerI18n();
  const filters = parseAccountFilters(await searchParams);
  const { items, total } = await listAccounts(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{t.accounts.title}</h1>
          <p className="mt-2 text-ink-soft">{t.accounts.intro}</p>
        </div>
        <CreateStaffDialog />
      </div>
      <AccountFiltersForm t={t} filters={filters} />
      <AccountsList t={t} locale={locale} items={items} total={total} filters={filters} />
    </div>
  );
}
