import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { formatDate } from "@/lib/utils/pregnancy";
import { countToday, visitsHref } from "../paths";
import { getRecordedCounts, listTodayAppointments, listVisits, parseVisitFilters } from "../queries/visits";
import type { TodayAppointment, VisitCounts as Counts, VisitFilters, VisitRow } from "../types";
import { TodayTickets } from "./today-tickets";
import { VisitCounts } from "./visit-counts";
import { VisitRows } from "./visit-rows";

type Params = Record<string, string | string[] | undefined>;

// /staff/visits?q=&from=&to=&page=. Reads the session and the address: render
// inside <Suspense>.
export async function VisitsScreen({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole(AREA_ROLES.staff);
  const today = manilaTodayISO();
  const filters = parseVisitFilters(await searchParams);
  const [{ t, locale }, todays, visits, recorded] = await Promise.all([
    getServerI18n(),
    listTodayAppointments(today),
    listVisits(filters),
    getRecordedCounts(today),
  ]);
  const counts = { ...countToday(todays), ...recorded };
  return <VisitsView t={t} locale={locale} today={today} counts={counts} todays={todays} visits={visits} filters={filters} />;
}

// The page layout, without data loading (also used by the dev preview): the
// title with Walk-in visit, the four counts, today's appointments as booking
// tickets, then every visit in a searchable, paged list grouped by day.
export function VisitsView({
  t,
  locale,
  today,
  counts,
  todays,
  visits,
  filters,
}: {
  t: Dictionary;
  locale: Locale;
  today: string;
  counts: Counts;
  todays: TodayAppointment[];
  visits: { items: VisitRow[]; total: number };
  filters: VisitFilters;
}) {
  const v = t.visits;
  const l = v.list;
  const hasFilters = Boolean(filters.q || filters.from || filters.to);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-title font-extrabold">{v.title}</h1>
            <p className="mt-2 text-ink-soft">{v.intro}</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/staff/visits/new" className="no-underline">
              <PlusIcon weight="bold" aria-hidden />
              {v.walkIn}
            </Link>
          </Button>
        </div>
        <VisitCounts t={t} counts={counts} today={today} />
      </div>

      <section id="today" aria-labelledby="visits-today" className="flex scroll-mt-24 flex-col gap-4">
        <h2 id="visits-today" className="text-lg font-bold">
          {v.today}
          <span className="block font-semibold text-ink-soft sm:inline">
            <span aria-hidden className="hidden sm:inline"> · </span>
            {formatDate(today, locale)}
          </span>
        </h2>
        <TodayTickets t={t} locale={locale} items={todays} />
      </section>

      <section id="recent" aria-labelledby="visits-recent" className="flex scroll-mt-24 flex-col gap-4">
        <h2 id="visits-recent" className="text-lg font-bold">
          {v.recent}
        </h2>
        <FilterToolbar
          id="visits"
          values={{ q: filters.q, from: filters.from, to: filters.to }}
          hidden={{}}
          labels={{
            form: l.filtersLabel,
            search: l.search,
            placeholder: l.searchPlaceholder,
            from: l.from,
            to: l.to,
            clear: l.clear,
            updating: l.updating,
          }}
          clearHref={hasFilters ? visitsHref(filters, { q: "", from: "", to: "" }) : null}
        >
          <VisitRows t={t} locale={locale} items={visits.items} total={visits.total} filters={filters} today={today} />
        </FilterToolbar>
      </section>
    </div>
  );
}
