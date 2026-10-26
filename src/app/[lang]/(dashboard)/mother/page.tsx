import { Suspense } from "react";
import { AreaPlaceholder } from "@/components/shared/area-placeholder";

export default function MotherHomePage() {
  return (
    <Suspense fallback={null}>
      <AreaPlaceholder area="mother" />
    </Suspense>
  );
}
