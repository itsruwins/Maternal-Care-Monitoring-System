import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function StaffProfilePage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.staff} navKey="profile" phase={2} />
    </Suspense>
  );
}
