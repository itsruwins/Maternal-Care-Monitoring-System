import { Suspense } from "react";
import { MyAppointmentsScreen } from "@/features/mother-appointments/components/my-appointments-screen";

export default function MotherAppointmentsPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <MyAppointmentsScreen />
    </Suspense>
  );
}
