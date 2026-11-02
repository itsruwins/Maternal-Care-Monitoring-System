import { Suspense } from "react";
import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { TodayAppointmentsPanel } from "@/features/visits/components/today-appointments-panel";

export default function StaffHomePage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <DashboardScreen todayList={<TodayAppointmentsPanel />} />
    </Suspense>
  );
}
