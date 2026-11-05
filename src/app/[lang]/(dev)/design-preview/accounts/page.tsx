import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccountsView } from "@/features/accounts/components/accounts-view";
import { parseAccountFilters } from "@/features/accounts/queries/list-accounts";
import type { AccountListItem, AccountTabCounts } from "@/features/accounts/types";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Accounts preview", robots: { index: false } };

const TODAY = "2026-11-04";

// Development only: the Accounts list with sample data (no login, no
// database). Takes the page's own filters (?q=&role=&status=); ?empty=1
// shows an empty search.
const ITEMS: AccountListItem[] = [
  { userId: "1", username: "taysan.admin", role: "ADMIN", status: "ACTIVE", createdAt: "2026-10-26T01:00:00Z", lastLoginAt: "2026-11-04T11:14:00Z", name: "Maria Santos", position: "Midwife" },
  { userId: "2", username: "joy.dela.cruz", role: "HEALTH_WORKER", status: "ACTIVE", createdAt: "2026-10-27T02:00:00Z", lastLoginAt: null, name: "Joy Dela Cruz", position: "Barangay Health Worker (BHW)" },
  { userId: "3", username: "liza.bns.taysan", role: "HEALTH_WORKER", status: "INACTIVE", createdAt: "2026-10-27T02:10:00Z", lastLoginAt: "2026-10-20T03:00:00Z", name: "Liza Ramos", position: "Barangay Nutrition Scholar (BNS)" },
  { userId: "4", username: "ana.reyes", role: "MOTHER", status: "ACTIVE", createdAt: "2026-10-27T04:00:00Z", lastLoginAt: "2026-11-03T01:30:00Z", name: "Ana Reyes", position: null },
  { userId: "5", username: "grace.villanueva", role: "MOTHER", status: "ACTIVE", createdAt: "2026-10-27T04:20:00Z", lastLoginAt: null, name: "Grace Villanueva", position: null },
  { userId: "6", username: "nurse.carla", role: "HEALTH_WORKER", status: "ACTIVE", createdAt: "2026-10-27T05:00:00Z", lastLoginAt: "2026-11-01T05:05:00Z", name: "Carla Bautista", position: "Nurse" },
  { userId: "7", username: "kristine.ocampo", role: "MOTHER", status: "ACTIVE", createdAt: "2026-10-28T05:00:00Z", lastLoginAt: "2026-10-30T09:05:00Z", name: "Kristine Mae Lopez Ocampo", position: null },
];

export default function AccountsPreview({ searchParams }: PageProps<"/[lang]/design-preview/accounts">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/accounts">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const filters = parseAccountFilters(params);
  const q = filters.q.toLowerCase();
  const matches = (item: AccountListItem, withRole: boolean) =>
    params.empty !== "1" &&
    (!withRole || !filters.role || item.role === filters.role) &&
    (!filters.status || (filters.status === "NEVER" ? item.lastLoginAt === null : item.status === filters.status)) &&
    (!q || item.username.includes(q) || (item.name ?? "").toLowerCase().includes(q));
  const items = ITEMS.filter((item) => matches(item, true));
  const byRole = ITEMS.filter((item) => matches(item, false));
  const tabs: AccountTabCounts = {
    all: byRole.length,
    HEALTH_WORKER: byRole.filter((item) => item.role === "HEALTH_WORKER").length,
    ADMIN: byRole.filter((item) => item.role === "ADMIN").length,
    MOTHER: byRole.filter((item) => item.role === "MOTHER").length,
  };
  const counts = {
    active: ITEMS.filter((item) => item.status === "ACTIVE").length,
    mothers: ITEMS.filter((item) => item.role === "MOTHER").length,
    never: ITEMS.filter((item) => item.lastLoginAt === null).length,
    inactive: ITEMS.filter((item) => item.status === "INACTIVE").length,
  };

  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <AccountsView t={t} locale={locale} items={items} total={items.length} tabs={tabs} counts={counts} filters={filters} today={TODAY} />
    </StaffShell>
  );
}
