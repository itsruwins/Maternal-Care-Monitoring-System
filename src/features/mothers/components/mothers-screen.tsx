import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { DUE_MONTHS_AHEAD, DUE_MONTHS_BACK } from "../constants";
import { dueMonthOptions, listMothers, parseMotherFilters } from "../queries/list-mothers";
import type { MotherFilters, MotherListItem, MotherTabCounts } from "../types";
import { MotherFiltersCard } from "./mother-filters";
import { MotherTabs } from "./mother-tabs";
import { MothersList } from "./mothers-list";

// /staff/mothers: the mother registry. Reads the session and the address:
// render inside <Suspense>.
export async function MothersScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(AREA_ROLES.staff);
  const { t, locale } = await getServerI18n();
  const filters = parseMotherFilters(await searchParams);
  const today = manilaTodayISO();
  const [{ items, total, counts }, puroks] = await Promise.all([listMothers(filters, today), getShownPuroks()]);
  return (
    <MothersView
      t={t}
      locale={locale}
      today={today}
      items={items}
      total={total}
      counts={counts}
      filters={filters}
      puroks={puroks}
      dueMonths={dueMonthOptions(today, DUE_MONTHS_BACK, DUE_MONTHS_AHEAD)}
    />
  );
}

// The page layout, without data loading (also used by the dev preview):
// title with everyone's count and Register a mother, the tabs, then one card
// holding the filter toolbar, the list and its footer.
export function MothersView({
  t,
  locale,
  today,
  items,
  total,
  counts,
  filters,
  puroks,
  dueMonths,
}: {
  t: Dictionary;
  locale: Locale;
  today: string;
  items: MotherListItem[];
  total: number;
  counts: MotherTabCounts;
  filters: MotherFilters;
  puroks: PurokOption[];
  dueMonths: string[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 text-title font-extrabold">
            {t.mothers.title}
            <span className="tnum inline-grid h-8 min-w-8 place-items-center rounded-full bg-mint px-2.5 text-base font-bold tracking-normal text-leaf">
              {counts.all}
            </span>
          </h1>
          <p className="mt-2 text-ink-soft">{t.mothers.intro}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/staff/mothers/new">
            <PlusIcon weight="bold" aria-hidden />
            {t.mothers.register.open}
          </Link>
        </Button>
      </div>
      <MotherTabs t={t} filters={filters} counts={counts} />
      <MotherFiltersCard t={t} locale={locale} filters={filters} puroks={puroks} dueMonths={dueMonths}>
        <MothersList t={t} locale={locale} items={items} total={total} filters={filters} today={today} />
      </MotherFiltersCard>
    </div>
  );
}
