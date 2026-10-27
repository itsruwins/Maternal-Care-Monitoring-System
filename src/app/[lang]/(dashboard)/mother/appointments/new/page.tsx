import { Suspense } from "react";
import { RequestVisitScreen } from "@/features/mother-appointments/components/request-visit-screen";

export default function RequestVisitPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <RequestVisitScreen />
    </Suspense>
  );
}
