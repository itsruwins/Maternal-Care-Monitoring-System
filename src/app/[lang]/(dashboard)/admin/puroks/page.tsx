import { Suspense } from "react";
import { PuroksScreen } from "@/features/puroks/components/puroks-screen";

export default function AdminPuroksPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <PuroksScreen />
    </Suspense>
  );
}
