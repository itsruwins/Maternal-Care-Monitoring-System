import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function StaffFollowUpsPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.staff} navKey="followUps" phase={6} />
    </Suspense>
  );
}
