import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { PillTabs } from "@/components/shared/pill-tabs";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { followUpsHref } from "../paths";
import { countFollowUpTabs, getFollowUpHubCounts, listFollowUps, parseFollowUpFilters } from "../queries/follow-ups";
import type { FollowUpFilters, FollowUpHubCounts, FollowUpItem, FollowUpTab, FollowUpTabCounts } from "../types";
import { ClosedFollowUps } from "./closed-follow-ups";
import { FollowUpCounts } from "./follow-up-counts";
import { FollowUpTickets } from "./follow-up-tickets";

const TABS: FollowUpTab[] = ["open", "closed"];

// /staff/follow-ups?tab=open|closed: missed visits to follow up. Reads the
// session and the address: render inside <Suspense>.
export async function FollowUpsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const filters = parseFollowUpFilters(await searchParams);
  const today = manilaTodayISO();
  const isAdmin = user.role === "ADMIN";
  const [{ t, locale }, { items, total }, tabCounts, counts, puroks] = await Promise.all([
    getServerI18n(),
    listFollowUps(filters, { isAdmin }, today),
    countFollowUpTabs(filters),
    getFollowUpHubCounts(today),
    getShownPuroks(),
  ]);
  return (
    <FollowUpsView
      t={t}
      locale={locale}
      items={items}
      total={total}
      tabCounts={tabCounts}
      counts={counts}
      filters={filters}
      puroks={puroks}
      today={today}
      isAdmin={isAdmin}
    />
  );
}

// The page layout, without data loading (also used by the dev preview): the
// title, the four counts, the Open / Closed tabs, the filter bar, then the
// open missed visits as tickets grouped by how long ago, or the closed ones
// as a quiet list.
export function FollowUpsView({
  t,
  locale,
  items,
  total,
  tabCounts,
  counts,
  filters,
  puroks,
  today,
  isAdmin,
}: {
  t: Dictionary;
  locale: Locale;
  items: FollowUpItem[];
  total: number;
  tabCounts: FollowUpTabCounts;
  counts: FollowUpHubCounts;
  filters: FollowUpFilters;
  puroks: PurokOption[];
  today: string;
  isAdmin: boolean;
}) {
  const f = t.followUps;
  const s = f.search;
  const open = filters.tab === "open";
  const hasFilters = Boolean(filters.q || filters.purok || filters.from || filters.to || filters.tried);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-title font-extrabold">{f.title}</h1>
          <p className="mt-2 text-ink-soft">{f.intro}</p>
        </div>
        <FollowUpCounts t={t} counts={counts} today={today} />
      </div>

      <section aria-label={f.title} className="flex flex-col gap-4">
        <PillTabs
          label={f.tabsLabel}
          tabs={TABS.map((key) => ({ key, label: f.tabs[key], count: tabCounts[key], href: followUpsHref(filters, { tab: key }), active: key === filters.tab }))}
        />
        <FilterToolbar
          id="follow-ups"
          detached={open}
          values={{ q: filters.q, purok: String(filters.purok), tried: filters.tried, from: filters.from, to: filters.to }}
          hidden={open ? {} : { tab: "closed" }}
          selects={[
            {
              name: "purok",
              label: s.purok,
              options: [
                { value: "", label: s.allPuroks },
                ...puroks.map((purok) => ({ value: String(purok.id), label: purok.name })),
                { value: "none", label: s.noPurok },
              ],
            },
            {
              name: "tried",
              label: s.tried,
              options: [
                { value: "", label: s.anyTried },
                { value: "no", label: s.notTried },
                { value: "yes", label: s.triedAlready },
              ],
            },
          ]}
          labels={{ form: f.list.filtersLabel, search: s.label, placeholder: s.placeholder, from: s.from, to: s.to, clear: s.clear, updating: f.list.updating }}
          clearHref={hasFilters ? followUpsHref(filters, { q: "", purok: "", from: "", to: "", tried: "" }) : null}
        >
          {open ? (
            <FollowUpTickets t={t} locale={locale} items={items} total={total} filters={filters} today={today} isAdmin={isAdmin} />
          ) : (
            <ClosedFollowUps t={t} locale={locale} items={items} total={total} filters={filters} />
          )}
        </FilterToolbar>
      </section>
    </div>
  );
}
