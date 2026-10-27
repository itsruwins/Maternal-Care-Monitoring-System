import { notFound } from "next/navigation";
import { ClosedDaysView } from "@/features/closed-days/components/closed-days-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Closed days preview", robots: { index: false } };

// Development only (preview): closed days with sample data.
export default async function ClosedDaysPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t, locale } = await getServerI18n();
  return (
    <StaffShell user={{ username: "taysan.admin", role: "ADMIN", firstName: "Maria", fullName: "Maria Santos" }}>
      <ClosedDaysView
        t={t}
        locale={locale}
        today="2026-10-27"
        upcoming={[
          { date: "2026-11-02", reason: "All Souls' Day", booked: 0 },
          { date: "2026-11-30", reason: "Bonifacio Day", booked: 2 },
          { date: "2026-12-08", reason: "Staff training at the City Health Office", booked: 0 },
        ]}
        past={[
          { date: "2026-08-31", reason: "National Heroes Day", booked: 0 },
          { date: "2026-08-21", reason: "Ninoy Aquino Day", booked: 0 },
        ]}
      />
    </StaffShell>
  );
}
