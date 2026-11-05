import { AccountsIcon, CheckCircleIcon, ClockIcon, MothersIcon } from "@/components/icons";
import { CountCards } from "@/components/shared/count-cards";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { PillTabs } from "@/components/shared/pill-tabs";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { accountsHref, NO_ACCOUNT_FILTERS } from "../paths";
import type { AccountCounts, AccountFilters, AccountListItem, AccountTabCounts } from "../types";
import { AccountsList } from "./accounts-list";
import { CreateStaffDialog } from "./create-staff-dialog";

const ROLE_TABS = ["", "HEALTH_WORKER", "ADMIN", "MOTHER"] as const;

// /admin/accounts layout (no data loading, so the dev preview can render it
// with sample data): the title with "New staff account", four counts over
// every account (each opening the list it counts; none of them urgent, so no
// rose), the role tabs with their counts, then the list in its filter card
// (search and status, applied at once).
export function AccountsView({
  t,
  locale,
  items,
  total,
  tabs,
  counts,
  filters,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  items: AccountListItem[];
  total: number;
  tabs: AccountTabCounts;
  counts: AccountCounts;
  filters: AccountFilters;
  /** Manila "YYYY-MM-DD", for "Today" and "Yesterday" logins. */
  today: string;
}) {
  const a = t.accounts;
  const s = a.search;
  const hasFilters = Boolean(filters.q || filters.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-title font-extrabold tracking-[-0.01em]">{a.title}</h1>
          <p className="mt-2 text-ink-soft">{a.intro}</p>
        </div>
        <CreateStaffDialog />
      </div>

      <CountCards
        label={a.hub.label}
        cards={[
          { key: "active", label: a.hub.active, count: counts.active, href: accountsHref(NO_ACCOUNT_FILTERS, { status: "ACTIVE" }), icon: CheckCircleIcon },
          { key: "mothers", label: a.hub.mothers, count: counts.mothers, href: accountsHref(NO_ACCOUNT_FILTERS, { role: "MOTHER" }), icon: MothersIcon },
          { key: "never", label: a.hub.never, count: counts.never, href: accountsHref(NO_ACCOUNT_FILTERS, { status: "NEVER" }), icon: ClockIcon },
          { key: "inactive", label: a.hub.inactive, count: counts.inactive, href: accountsHref(NO_ACCOUNT_FILTERS, { status: "INACTIVE" }), icon: AccountsIcon },
        ]}
      />

      <div className="flex flex-col gap-4">
        <PillTabs
          label={a.tabs.label}
          tabs={ROLE_TABS.map((role) => ({
            key: role || "all",
            label: role ? a.tabs[role] : a.tabs.all,
            count: tabs[role || "all"],
            href: accountsHref(filters, { role }),
            active: filters.role === role,
          }))}
        />
        <FilterToolbar
          id="accounts"
          dates={false}
          values={{ q: filters.q, status: filters.status }}
          hidden={filters.role ? { role: filters.role } : {}}
          selects={[
            {
              name: "status",
              label: s.status,
              options: [
                { value: "", label: s.all },
                { value: "ACTIVE", label: a.statuses.ACTIVE },
                { value: "INACTIVE", label: a.statuses.INACTIVE },
                { value: "NEVER", label: a.login.never },
              ],
            },
          ]}
          labels={{ form: s.form, search: s.label, placeholder: s.placeholder, clear: s.clear, updating: s.updating }}
          clearHref={hasFilters ? accountsHref(filters, { q: "", status: "" }) : null}
        >
          <AccountsList t={t} locale={locale} items={items} total={total} filters={filters} today={today} />
        </FilterToolbar>
      </div>
    </div>
  );
}
