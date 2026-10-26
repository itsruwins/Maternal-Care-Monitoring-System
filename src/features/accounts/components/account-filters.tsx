import { InputIcon } from "@/components/ui/input-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { AccountFilters } from "../types";

// Search + role + status. A plain GET form: the filters live in the address
// (?q=&role=&status=), so they survive a refresh and can be shared.
export function AccountFiltersForm({ t, filters }: { t: Dictionary; filters: AccountFilters }) {
  const a = t.accounts;
  const hasFilters = Boolean(filters.q || filters.role || filters.status);

  return (
    <form method="get" className="grid gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[minmax(0,1fr)_11rem_10rem_auto] sm:items-end sm:p-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="accounts-q">{a.search.label}</Label>
        <InputIcon icon={UserIcon}>
          <Input id="accounts-q" name="q" defaultValue={filters.q} placeholder={a.search.placeholder} className="pl-11" />
        </InputIcon>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="accounts-role">{a.search.role}</Label>
        <NativeSelect id="accounts-role" name="role" defaultValue={filters.role}>
          <option value="">{a.search.all}</option>
          <option value="ADMIN">{t.shell.roles.ADMIN}</option>
          <option value="HEALTH_WORKER">{t.shell.roles.HEALTH_WORKER}</option>
          <option value="MOTHER">{t.shell.roles.MOTHER}</option>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="accounts-status">{a.search.status}</Label>
        <NativeSelect id="accounts-status" name="status" defaultValue={filters.status}>
          <option value="">{a.search.all}</option>
          <option value="ACTIVE">{a.statuses.ACTIVE}</option>
          <option value="INACTIVE">{a.statuses.INACTIVE}</option>
        </NativeSelect>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="h-12 flex-1 sm:flex-none">
          {a.search.submit}
        </Button>
        {hasFilters && (
          <Button asChild variant="ghost" className="h-12">
            <a href="?">{a.search.clear}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
