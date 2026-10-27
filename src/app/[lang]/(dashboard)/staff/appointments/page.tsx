import { Suspense } from "react";
import { AppointmentsScreen } from "@/features/appointments/components/appointments-screen";

export default function StaffAppointmentsPage({ searchParams }: PageProps<"/[lang]/staff/appointments">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <AppointmentsScreen searchParams={searchParams} />
    </Suspense>
  );
}
