import { notFound } from "next/navigation";
import { ProfileView } from "@/features/profile/components/profile-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Staff profile preview", robots: { index: false } };

// Development only: a health worker's profile with sample data.
export default async function StaffProfilePreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <ProfileView
        t={t}
        role="HEALTH_WORKER"
        profile={{
          username: "joy.dela.cruz",
          kind: "staff",
          email: null,
          details: { firstName: "Joy", middleName: "Mendoza", lastName: "Dela Cruz", contactNumber: "09171234567", position: "Barangay Health Worker (BHW)" },
        }}
      />
    </StaffShell>
  );
}
