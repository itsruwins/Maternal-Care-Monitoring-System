import { Suspense } from "react";
import { AccountDetailScreen } from "@/features/accounts/components/account-detail-screen";

export default function AdminAccountPage({ params }: PageProps<"/[lang]/admin/accounts/[userId]">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <AccountDetailScreen params={params} />
    </Suspense>
  );
}
