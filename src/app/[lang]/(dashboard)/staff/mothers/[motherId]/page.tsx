import { Suspense } from "react";
import { MotherRecordScreen } from "@/features/mothers/components/mother-record-screen";

export default function MotherRecordPage({ params, searchParams }: PageProps<"/[lang]/staff/mothers/[motherId]">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <MotherRecordScreen params={params} searchParams={searchParams} />
    </Suspense>
  );
}
