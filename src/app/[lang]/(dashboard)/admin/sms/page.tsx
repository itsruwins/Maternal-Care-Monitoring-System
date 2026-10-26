import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function AdminSmsLogPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.admin} navKey="smsLog" phase={7} />
    </Suspense>
  );
}
