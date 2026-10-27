import { notFound } from "next/navigation";
import { ActivityTypesView } from "@/features/activity-types/components/activity-types-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Activity types preview", robots: { index: false } };

// Development only (preview): the activity types with the seeded values.
export default async function ActivityTypesPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <ActivityTypesView
        t={t}
        types={[
          { id: 1, name: "Prenatal Checkup", description: "Routine prenatal consultation and monitoring", reminderDaysBefore: 1 },
          { id: 2, name: "Tetanus Toxoid Vaccination", description: "Maternal tetanus toxoid immunization", reminderDaysBefore: 1 },
          { id: 3, name: "Iron / Folic Acid Supplementation", description: "Iron and folic acid supplementation", reminderDaysBefore: 1 },
          { id: 4, name: "Laboratory Test", description: "Requested maternal laboratory investigations", reminderDaysBefore: 2 },
          { id: 5, name: "Health Education Session", description: "Maternal health education and counseling", reminderDaysBefore: 0 },
        ]}
      />
    </StaffShell>
  );
}
