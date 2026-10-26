import { Suspense } from "react";
import { AreaPlaceholder } from "@/components/shared/area-placeholder";

export default function StaffHomePage() {
  return (
    <Suspense fallback={null}>
      <AreaPlaceholder area="staff" />
    </Suspense>
  );
}
