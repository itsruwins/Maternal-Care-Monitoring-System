import { Suspense } from "react";
import { MyVisitDetailScreen } from "@/features/mother-visits/components/my-visits-screen";

export default function MotherVisitPage({ params }: PageProps<"/[lang]/mother/visits/[visitId]">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <MyVisitDetailScreen params={params} />
    </Suspense>
  );
}
