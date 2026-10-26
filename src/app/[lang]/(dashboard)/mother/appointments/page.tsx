import { Suspense } from "react";
import { ComingSoon } from "@/features/shell/components/coming-soon";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function MotherAppointmentsPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoon roles={AREA_ROLES.mother} navKey="appointments" phase={4} />
    </Suspense>
  );
}
