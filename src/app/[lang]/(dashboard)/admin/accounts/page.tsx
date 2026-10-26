import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function AdminAccountsPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.admin} navKey="accounts" phase={2} />
    </Suspense>
  );
}
