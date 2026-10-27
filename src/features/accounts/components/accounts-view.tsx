import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { AccountFilters, AccountListItem } from "../types";
import { AccountFiltersForm } from "./account-filters";
import { AccountsList } from "./accounts-list";
import { CreateStaffDialog } from "./create-staff-dialog";

// /admin/accounts layout: title + "New staff account", filters, then the list.
// No data loading, so the dev preview can render it with sample data.
export function AccountsView({
  t,
  locale,
  items,
  total,
  filters,
}: {
  t: Dictionary;
  locale: Locale;
  items: AccountListItem[];
  total: number;
  filters: AccountFilters;
}) {
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
