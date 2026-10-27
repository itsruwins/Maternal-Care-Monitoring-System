import { notFound } from "next/navigation";
import { AccountDetailView } from "@/features/accounts/components/account-detail-view";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Account preview", robots: { index: false } };

// Development only: one staff account with sample data.
export default async function AccountPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <AccountDetailView
        t={t}
        locale={locale}
        isSelf={false}
        account={{
          userId: "2",
          username: "joy.dela.cruz",
          role: "HEALTH_WORKER",
          status: "ACTIVE",
          createdAt: "2026-10-27T02:00:00Z",
          lastLoginAt: null,
          email: null,
          mustChangePassword: true,
          staff: { firstName: "Joy", middleName: "Mendoza", lastName: "Dela Cruz", position: "Barangay Health Worker (BHW)", contactNumber: "09171234567" },
          mother: null,
        }}
      />
    </StaffShell>
  );
}
