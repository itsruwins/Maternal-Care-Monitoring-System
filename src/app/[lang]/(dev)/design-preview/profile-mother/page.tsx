import { notFound } from "next/navigation";
import { ProfileView } from "@/features/profile/components/profile-screen";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Mother profile preview", robots: { index: false } };

// Development only: a mother's profile with sample data.
export default async function MotherProfilePreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <MotherShell user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <ProfileView
        t={t}
        role="MOTHER"
        profile={{
          username: "ana.reyes",
          kind: "mother",
          email: "ana.reyes@example.com",
          details: {
            firstName: "Ana",
            middleName: "",
            lastName: "Reyes",
            contactNumber: "09181234567",
            purok: "Purok 3",
            street: "12 Rizal St.",
            emergencyName: "Jose Reyes",
            emergencyNumber: "09191234567",
          },
        }}
      />
    </MotherShell>
  );
}
