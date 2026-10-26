import { Suspense } from "react";
import { Welcome } from "@/features/shell/components/welcome";
import { AREA_ROLES } from "@/lib/auth/roles";


export default function MotherHomePage() {
  return (
    <Suspense fallback={null}>
      <Welcome roles={AREA_ROLES.mother} kind="mother" />
    </Suspense>
  );
}
