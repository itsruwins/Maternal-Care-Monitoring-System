import { UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { FiltersDisclosure } from "@/features/mothers/components/filters-disclosure";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PurokOption } from "@/lib/puroks/types";
import { followUpsHref } from "../paths";
import type { FollowUpFilters } from "../types";

// Search + purok + missed date range + tried or not. A plain GET form: the
// filters live in the address, so they survive a refresh and the tabs keep them.
export function FollowUpFiltersForm({ t, filters, puroks }: { t: Dictionary; filters: FollowUpFilters; puroks: PurokOption[] }) {
  const s = t.followUps.search;
  const extraFilters = [filters.purok, filters.from, filters.to, filters.tried].filter(Boolean).length;
  const hasFilters = Boolean(filters.q) || extraFilters > 0;

  return (
    <form method="get" className="grid gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 sm:p-5 xl:grid-cols-4 xl:items-end">
      {filters.tab === "closed" && <input type="hidden" name="tab" value="closed" />}
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="follow-ups-q">{s.label}</Label>
        <InputIcon icon={UserIcon}>
          <Input id="follow-ups-q" name="q" defaultValue={filters.q} placeholder={s.placeholder} className="pl-11" />
        </InputIcon>
      </div>
      <FiltersDisclosure label={s.filters} active={extraFilters}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="follow-ups-purok">{s.purok}</Label>
          <NativeSelect id="follow-ups-purok" name="purok" defaultValue={String(filters.purok)}>
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
          <Label htmlFor="follow-ups-tried">{s.tried}</Label>
          <NativeSelect id="follow-ups-tried" name="tried" defaultValue={filters.tried}>
            <option value="">{s.anyTried}</option>
            <option value="no">{s.notTried}</option>
            <option value="yes">{s.triedAlready}</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="follow-ups-from">{s.from}</Label>
          <Input id="follow-ups-from" name="from" type="date" defaultValue={filters.from} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="follow-ups-to">{s.to}</Label>
          <Input id="follow-ups-to" name="to" type="date" defaultValue={filters.to} />
        </div>
      </FiltersDisclosure>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" className="h-12 flex-1 xl:flex-none xl:px-8">
          {s.submit}
        </Button>
        {hasFilters && (
          <Button asChild variant="ghost" className="h-12">
            <a href={followUpsHref({ ...filters, q: "", purok: "", from: "", to: "", tried: "" })}>{s.clear}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
