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
import type { MotherFilters, MotherListItem } from "../types";
import { MotherFiltersForm } from "./mother-filters";
import { MothersList } from "./mothers-list";

// /staff/mothers: the mother registry. Reads the session and the address:
// render inside <Suspense>.
export async function MothersScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole(AREA_ROLES.staff);
  const { t, locale } = await getServerI18n();
  const filters = parseMotherFilters(await searchParams);
  const today = manilaTodayISO();
  const [{ items, total }, puroks] = await Promise.all([listMothers(filters, today), getShownPuroks()]);
  return (
    <MothersView
      t={t}
      locale={locale}
      items={items}
      total={total}
      filters={filters}
      puroks={puroks}
      dueMonths={dueMonthOptions(today, DUE_MONTHS_BACK, DUE_MONTHS_AHEAD)}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function MothersView({
  t,
  locale,
  items,
  total,
  filters,
  puroks,
  dueMonths,
}: {
  t: Dictionary;
  locale: Locale;
  items: MotherListItem[];
  total: number;
  filters: MotherFilters;
  puroks: PurokOption[];
  dueMonths: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title font-extrabold">{t.mothers.title}</h1>
        <p className="mt-2 text-ink-soft">{t.mothers.intro}</p>
      </div>
      <MotherFiltersForm t={t} locale={locale} filters={filters} puroks={puroks} dueMonths={dueMonths} />
      <MothersList t={t} locale={locale} items={items} total={total} filters={filters} />
    </div>
  );
}
