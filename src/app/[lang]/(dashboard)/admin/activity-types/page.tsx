import { Suspense } from "react";
import { ActivityTypesScreen } from "@/features/activity-types/components/activity-types-screen";

export default function AdminActivityTypesPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <ActivityTypesScreen />
    </Suspense>
  );
}
