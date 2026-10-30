import { Suspense } from "react";
import { RebookScreen } from "@/features/follow-ups/components/rebook-screen";

export default function RebookPage({ params }: PageProps<"/[lang]/staff/follow-ups/[appointmentId]/rebook">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <RebookScreen params={params} />
    </Suspense>
  );
}
