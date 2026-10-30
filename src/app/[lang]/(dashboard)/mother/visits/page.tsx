import { Suspense } from "react";
import { MyVisitsScreen } from "@/features/mother-visits/components/my-visits-screen";

export default function MotherVisitsPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <MyVisitsScreen />
    </Suspense>
  );
}
