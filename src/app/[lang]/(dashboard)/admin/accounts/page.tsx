import { Suspense } from "react";
import { AccountsScreen } from "@/features/accounts/components/accounts-screen";

export default function AdminAccountsPage({ searchParams }: PageProps<"/[lang]/admin/accounts">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <AccountsScreen searchParams={searchParams} />
    </Suspense>
  );
}
