import { Suspense } from "react";
import { TodayScreen } from "@/features/mother-home/components/today-screen";

export default function MotherHomePage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-[32rem] animate-pulse rounded-3xl bg-white/60" />}>
      <TodayScreen />
    </Suspense>
  );
}
