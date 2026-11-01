import { Suspense } from "react";
import { SmsScreen } from "@/features/sms/components/sms-screen";

export default function AdminSmsLogPage({ searchParams }: PageProps<"/[lang]/admin/sms">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <SmsScreen searchParams={searchParams} />
    </Suspense>
  );
}
