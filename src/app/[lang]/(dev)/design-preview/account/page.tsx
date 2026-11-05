import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccountDetailView } from "@/features/accounts/components/account-detail-view";
import type { AccountDetail } from "@/features/accounts/queries/get-account";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Account preview", robots: { index: false } };

// Development only: one account with sample data. A staff account by
// default; ?role=mother shows a mother's, ?off=1 a deactivated one, ?self=1
// your own (no actions).
const STAFF: AccountDetail = {
  userId: "2",
  username: "joy.dela.cruz",
  role: "HEALTH_WORKER",
  status: "ACTIVE",
  createdAt: "2026-10-27T02:00:00Z",
  lastLoginAt: "2026-11-02T11:18:00Z",
  email: "joy.delacruz@example.com",
  mustChangePassword: false,
  staff: { firstName: "Joy", middleName: "Mendoza", lastName: "Dela Cruz", position: "Barangay Health Worker (BHW)", contactNumber: "09171234567" },
  mother: null,
};

const MOTHER: AccountDetail = {
  userId: "4",
  username: "ana.reyes",
  role: "MOTHER",
  status: "ACTIVE",
  createdAt: "2026-10-27T06:59:00Z",
  lastLoginAt: null,
  email: null,
  mustChangePassword: true,
  staff: null,
  mother: { id: 1, firstName: "Ana", lastName: "Reyes", contactNumber: "09181234567", purok: "Purok 3" },
};

export default function AccountPreview({ searchParams }: PageProps<"/[lang]/design-preview/account">) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <Preview searchParams={searchParams} />
    </Suspense>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<"/[lang]/design-preview/account">["searchParams"] }) {
  const [{ t, locale }, params] = await Promise.all([getServerI18n(), searchParams]);
  const base = params.role === "mother" ? MOTHER : STAFF;
  const account: AccountDetail = params.off === "1" ? { ...base, status: "INACTIVE" } : base;
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <AccountDetailView t={t} locale={locale} account={account} isSelf={params.self === "1"} today="2026-11-04" />
    </StaffShell>
  );
}
