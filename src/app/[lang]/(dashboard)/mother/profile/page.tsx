import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function MotherProfilePage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.mother} navKey="profile" phase={2} />
    </Suspense>
  );
}
