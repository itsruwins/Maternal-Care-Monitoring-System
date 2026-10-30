import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { cn } from "@/lib/utils/cn";
import { followUpsHref } from "../paths";
import { countOpenFollowUps, listFollowUps, parseFollowUpFilters } from "../queries/follow-ups";
import type { FollowUpFilters, FollowUpItem, FollowUpTab } from "../types";
import { FollowUpFiltersForm } from "./follow-up-filters";
import { FollowUpList } from "./follow-up-list";

const TABS: FollowUpTab[] = ["open", "closed"];

// /staff/follow-ups?tab=open|closed: missed visits to follow up. Reads the
// session and the address: render inside <Suspense>.
export async function FollowUpsScreen({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const filters = parseFollowUpFilters(await searchParams);
  const today = manilaTodayISO();
  const isAdmin = user.role === "ADMIN";
  const [{ t, locale }, { items, total }, openCount, puroks] = await Promise.all([
    getServerI18n(),
    listFollowUps(filters, { isAdmin }, today),
    countOpenFollowUps(),
    getShownPuroks(),
  ]);
  return (
    <FollowUpsView
      t={t}
      locale={locale}
      items={items}
      total={total}
      openCount={openCount}
      filters={filters}
      puroks={puroks}
      today={today}
      isAdmin={isAdmin}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function FollowUpsView({
  t,
  locale,
  items,
  total,
  openCount,
  filters,
  puroks,
  today,
  isAdmin,
}: {
  t: Dictionary;
  locale: Locale;
  items: FollowUpItem[];
  total: number;
  openCount: number;
  filters: FollowUpFilters;
  puroks: PurokOption[];
  today: string;
  isAdmin: boolean;
}) {
  const f = t.followUps;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title font-extrabold">{f.title}</h1>
        <p className="mt-2 text-ink-soft">{f.intro}</p>
      </div>
      <nav aria-label={f.tabsLabel} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-1 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
          {TABS.map((key) => {
            const active = key === filters.tab;
            return (
              <li key={key}>
                <Link
                  href={followUpsHref(filters, { tab: key })}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {f.tabs[key]}
                  {key === "open" && openCount > 0 && (
                    <span className="tnum grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1.5 text-caption font-bold text-white">{openCount}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <FollowUpFiltersForm t={t} filters={filters} puroks={puroks} />
      <FollowUpList t={t} locale={locale} items={items} total={total} filters={filters} today={today} isAdmin={isAdmin} />
    </div>
  );
}
