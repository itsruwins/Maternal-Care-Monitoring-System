import { Suspense } from "react";
import { VisitsScreen } from "@/features/visits/components/visits-screen";

export default function StaffVisitsPage({ searchParams }: PageProps<"/[lang]/staff/visits">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <VisitsScreen searchParams={searchParams} />
    </Suspense>
  );
}
