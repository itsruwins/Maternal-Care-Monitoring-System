import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function StaffReportsPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.staff} navKey="reports" phase={8} />
    </Suspense>
  );
}
