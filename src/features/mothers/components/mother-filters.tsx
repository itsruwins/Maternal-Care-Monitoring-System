import { UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PurokOption } from "@/lib/puroks/types";
import { formatMonth } from "@/lib/utils/manila-date";
import type { MotherFilters } from "../types";
import { FiltersDisclosure } from "./filters-disclosure";

// Search + purok + due month + pregnancy. A plain GET form: the filters live in
// the address (?q=&purok=&due=&status=), so they survive a refresh.
export function MotherFiltersForm({
  t,
  locale,
  filters,
  puroks,
  dueMonths,
}: {
  t: Dictionary;
  locale: Locale;
  filters: MotherFilters;
  puroks: PurokOption[];
  dueMonths: string[];
}) {
  const s = t.mothers.search;
  const hasFilters = Boolean(filters.q || filters.purok || filters.due || filters.status);
  const extraFilters = [filters.purok, filters.due, filters.status].filter(Boolean).length;

  return (
    <form
      method="get"
      className="grid gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-3 sm:p-5 xl:grid-cols-[minmax(0,1fr)_10rem_11rem_10.5rem_auto] xl:items-end"
    >
      <div className="flex flex-col gap-2 sm:col-span-3 xl:col-span-1">
        <Label htmlFor="mothers-q">{s.label}</Label>
        <InputIcon icon={UserIcon}>
          <Input id="mothers-q" name="q" defaultValue={filters.q} placeholder={s.placeholder} className="pl-11" />
        </InputIcon>
      </div>
      <FiltersDisclosure label={s.filters} active={extraFilters}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mothers-purok">{s.purok}</Label>
          <NativeSelect id="mothers-purok" name="purok" defaultValue={String(filters.purok)}>
            <option value="">{s.allPuroks}</option>
            {puroks.map((purok) => (
              <option key={purok.id} value={String(purok.id)}>
                {purok.name}
              </option>
            ))}
            <option value="none">{s.noPurok}</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mothers-due">{s.due}</Label>
          <NativeSelect id="mothers-due" name="due" defaultValue={filters.due}>
            <option value="">{s.anyMonth}</option>
            <option value="soon">{s.dueSoon}</option>
            {dueMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month, locale)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mothers-status">{s.status}</Label>
          <NativeSelect id="mothers-status" name="status" defaultValue={filters.status}>
            <option value="">{s.all}</option>
            <option value="pregnant">{s.pregnant}</option>
            <option value="notPregnant">{s.notPregnant}</option>
          </NativeSelect>
        </div>
      </FiltersDisclosure>
      <div className="flex gap-2 sm:col-span-3 xl:col-span-1">
        <Button type="submit" className="h-12 flex-1 xl:flex-none">
          {s.submit}
        </Button>
        {hasFilters && (
          <Button asChild variant="ghost" className="h-12">
            <a href="?">{s.clear}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
