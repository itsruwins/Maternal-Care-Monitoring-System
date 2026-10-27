import { Suspense } from "react";
import { ClosedDaysScreen } from "@/features/closed-days/components/closed-days-screen";

export default function AdminClosedDaysPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <ClosedDaysScreen />
    </Suspense>
  );
}
