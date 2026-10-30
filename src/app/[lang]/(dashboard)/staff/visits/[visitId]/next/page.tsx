import { Suspense } from "react";
import { NextStepScreen } from "@/features/visits/components/next-step-screen";

export default function VisitNextStepPage({ params }: PageProps<"/[lang]/staff/visits/[visitId]/next">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <NextStepScreen params={params} />
    </Suspense>
  );
}
