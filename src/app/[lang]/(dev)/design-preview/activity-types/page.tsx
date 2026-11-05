import { notFound } from "next/navigation";
import { ActivityTypesView } from "@/features/activity-types/components/activity-types-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Activity types preview", robots: { index: false } };

// Development only (preview): the activity types as seeded (0011 added four;
// 0013 removed Laboratory Test), a few reminder timings varied.
export default async function ActivityTypesPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <ActivityTypesView
        t={t}
        types={[
          { id: 1, name: "Prenatal Checkup", description: "Routine prenatal consultation and monitoring", reminderDaysBefore: 1, icon: "checkup" },
          { id: 2, name: "Tetanus Toxoid Vaccination", description: "Maternal tetanus toxoid immunization", reminderDaysBefore: 1, icon: "vaccine" },
          { id: 3, name: "Iron / Folic Acid Supplementation", description: "Iron and folic acid supplementation", reminderDaysBefore: 1, icon: "supplement" },
          { id: 5, name: "Health Education Session", description: "Maternal health education and counseling", reminderDaysBefore: 0, icon: "education" },
          { id: 6, name: "Nutrition Counseling", description: "Diet and healthy weight advice during pregnancy", reminderDaysBefore: 1, icon: "nutrition" },
          { id: 7, name: "Prenatal Dental Checkup", description: "Oral health check for pregnant women", reminderDaysBefore: 2, icon: "dental" },
          { id: 8, name: "Fetal Heartbeat Check", description: "Listening to the baby's heartbeat", reminderDaysBefore: 1, icon: "heartbeat" },
          { id: 9, name: "Birth Plan Counseling", description: "Planning where and how to give birth, and what to prepare", reminderDaysBefore: 3, icon: "counseling" },
        ]}
      />
    </StaffShell>
  );
}
