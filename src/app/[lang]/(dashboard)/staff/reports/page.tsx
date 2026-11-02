import { Suspense } from "react";
import { ReportsScreen } from "@/features/reports/components/reports-screen";

export default function StaffReportsPage({ searchParams }: PageProps<"/[lang]/staff/reports">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <ReportsScreen searchParams={searchParams} />
    </Suspense>
  );
}
