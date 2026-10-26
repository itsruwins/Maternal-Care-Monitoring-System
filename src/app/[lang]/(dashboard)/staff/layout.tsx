import { Suspense } from "react";
import { ShellSkeleton, StaffShellLoader } from "@/features/shell/components/shell-loaders";
import { AREA_ROLES } from "@/lib/auth/roles";

// The staff app shell (sidebar + top bar).
export default function StaffLayout({ children }: LayoutProps<"/[lang]/staff">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <StaffShellLoader roles={AREA_ROLES.staff}>{children}</StaffShellLoader>
    </Suspense>
  );
}
