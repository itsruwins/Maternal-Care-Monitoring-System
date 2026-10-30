import { Suspense } from "react";
import { EditVisitScreen } from "@/features/visits/components/visit-detail-screen";

export default function EditVisitPage({ params }: PageProps<"/[lang]/staff/visits/[visitId]/edit">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <EditVisitScreen params={params} />
    </Suspense>
  );
}
