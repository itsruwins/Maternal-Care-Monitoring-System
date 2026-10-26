import { Suspense } from "react";
import { AreaPlaceholder } from "@/components/shared/area-placeholder";

export default function AdminHomePage() {
  return (
    <Suspense fallback={null}>
      <AreaPlaceholder area="admin" />
    </Suspense>
  );
}
