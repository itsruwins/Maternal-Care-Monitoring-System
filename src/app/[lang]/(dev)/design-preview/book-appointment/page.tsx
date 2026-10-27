import { notFound } from "next/navigation";
import { BookAppointmentView } from "@/features/appointments/components/book-appointment-screen";
import { StaffShell } from "@/features/shell/components/staff-shell";
import { getServerI18n } from "@/i18n/server";
import { SAMPLE_SLOTS } from "../staff-appointments/sample";

export const metadata = { title: "Book appointment preview", robots: { index: false } };

// Development only (preview): booking with a chosen mother.
export default async function BookAppointmentPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <StaffShell user={{ username: "joy.dela.cruz", role: "HEALTH_WORKER", firstName: "Joy", fullName: "Joy Dela Cruz" }}>
      <BookAppointmentView
        t={t}
        q=""
        mother={{ id: 1, pregnancyId: 11, name: "Ana Marie Bautista", contactNumber: "09171234567", weeks: 21 }}
        results={[]}
        searched={false}
        services={[
          { id: 1, name: "Prenatal Checkup" },
          { id: 2, name: "Tetanus Toxoid Vaccination" },
          { id: 3, name: "Iron / Folic Acid Supplementation" },
          { id: 4, name: "Laboratory Test" },
          { id: 5, name: "Health Education Session" },
        ]}
        slots={SAMPLE_SLOTS}
      />
    </StaffShell>
  );
}
