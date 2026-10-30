import { Suspense } from "react";
import { VisitDetailScreen } from "@/features/visits/components/visit-detail-screen";

export default function VisitDetailPage({ params }: PageProps<"/[lang]/staff/visits/[visitId]">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <VisitDetailScreen params={params} />
    </Suspense>
  );
}
