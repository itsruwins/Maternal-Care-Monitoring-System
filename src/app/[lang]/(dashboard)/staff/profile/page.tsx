import { Suspense } from "react";
import { ProfileScreen } from "@/features/profile/components/profile-screen";
import { AREA_ROLES } from "@/lib/auth/roles";

export default function StaffProfilePage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-white/60" />}>
      <ProfileScreen roles={AREA_ROLES.staff} />
    </Suspense>
  );
}
