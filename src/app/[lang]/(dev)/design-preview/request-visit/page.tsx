import { notFound } from "next/navigation";
import { RequestVisitView } from "@/features/mother-appointments/components/request-visit-screen";
import { MotherShell } from "@/features/shell/components/mother-shell";
import { getServerI18n } from "@/i18n/server";
import { bookingWindow } from "@/lib/appointments/slots";

export const metadata = { title: "Request a visit preview", robots: { index: false } };

const TODAY = "2026-10-27";

// Development only (preview): the request form with sample availability.
export default async function RequestVisitPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  const { first, last } = bookingWindow(TODAY);
  const full = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"].map((time) => `2026-11-06T${time}`);
  return (
    <MotherShell user={{ username: "ana.reyes", role: "MOTHER", firstName: "Ana", fullName: "Ana Reyes" }}>
      <RequestVisitView
        t={t}
        data={{
          services: [
            { id: 1, name: "Prenatal Checkup", description: "Routine prenatal consultation and monitoring" },
            { id: 2, name: "Tetanus Toxoid Vaccination", description: "Maternal tetanus toxoid immunization" },
            { id: 3, name: "Iron / Folic Acid Supplementation", description: "Iron and folic acid supplementation" },
            { id: 4, name: "Laboratory Test", description: "Requested maternal laboratory investigations" },
            { id: 5, name: "Health Education Session", description: "Maternal health education and counseling" },
          ],
          today: TODAY,
          first,
          last,
          closedDays: ["2026-11-02", "2026-11-30"],
          taken: ["2026-11-05T09:00", "2026-11-05T09:30", "2026-11-05T13:00", ...full],
        }}
      />
    </MotherShell>
  );
}
