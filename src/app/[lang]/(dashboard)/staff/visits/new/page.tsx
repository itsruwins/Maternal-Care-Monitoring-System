import { Suspense } from "react";
import { RecordVisitScreen } from "@/features/visits/components/record-visit-screen";

export default function RecordVisitPage({ searchParams }: PageProps<"/[lang]/staff/visits/new">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <RecordVisitScreen searchParams={searchParams} />
    </Suspense>
  );
}
