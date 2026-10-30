import { Suspense } from "react";
import { FollowUpsScreen } from "@/features/follow-ups/components/follow-ups-screen";

export default function StaffFollowUpsPage({ searchParams }: PageProps<"/[lang]/staff/follow-ups">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <FollowUpsScreen searchParams={searchParams} />
    </Suspense>
  );
}
