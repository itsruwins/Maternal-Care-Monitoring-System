import { Suspense } from "react";
import { MothersScreen } from "@/features/mothers/components/mothers-screen";

export default function StaffMothersPage({ searchParams }: PageProps<"/[lang]/staff/mothers">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <MothersScreen searchParams={searchParams} />
    </Suspense>
  );
}
