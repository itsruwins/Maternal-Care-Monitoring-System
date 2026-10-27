import { notFound } from "next/navigation";
import { AccountsView } from "@/features/accounts/components/accounts-view";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import type { AccountListItem } from "@/features/accounts/types";

export const metadata = { title: "Accounts preview", robots: { index: false } };

// Development only: the Accounts list with sample data (no login, no database).
const ITEMS: AccountListItem[] = [
  { userId: "1", username: "taysan.admin", role: "ADMIN", status: "ACTIVE", createdAt: "2026-10-26T01:00:00Z", lastLoginAt: "2026-10-27T00:41:00Z", name: "Maria Santos", position: "Midwife" },
  { userId: "2", username: "joy.dela.cruz", role: "HEALTH_WORKER", status: "ACTIVE", createdAt: "2026-10-27T02:00:00Z", lastLoginAt: null, name: "Joy Dela Cruz", position: "Barangay Health Worker (BHW)" },
  { userId: "3", username: "liza.bns.taysan", role: "HEALTH_WORKER", status: "INACTIVE", createdAt: "2026-10-27T02:10:00Z", lastLoginAt: "2026-10-27T03:00:00Z", name: "Liza Ramos", position: "Barangay Nutrition Scholar (BNS)" },
  { userId: "4", username: "ana.reyes", role: "MOTHER", status: "ACTIVE", createdAt: "2026-10-27T04:00:00Z", lastLoginAt: "2026-10-27T04:30:00Z", name: "Ana Reyes", position: null },
  { userId: "5", username: "grace.villanueva", role: "MOTHER", status: "ACTIVE", createdAt: "2026-10-27T04:20:00Z", lastLoginAt: null, name: "Grace Villanueva", position: null },
  { userId: "6", username: "nurse.carla", role: "HEALTH_WORKER", status: "ACTIVE", createdAt: "2026-10-27T05:00:00Z", lastLoginAt: "2026-10-27T05:05:00Z", name: "Carla Bautista", position: "Nurse" },
];

export default async function AccountsPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <AccountsView t={t} locale={locale} items={ITEMS} total={46} filters={{ q: "", role: "", status: "", page: 1 }} />
    </StaffShell>
  );
}
