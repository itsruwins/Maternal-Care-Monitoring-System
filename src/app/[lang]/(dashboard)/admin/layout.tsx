import { Suspense } from "react";
import { ShellSkeleton, StaffShellLoader } from "@/features/shell/components/shell-loaders";
import { AREA_ROLES } from "@/lib/auth/roles";

// The staff app shell (sidebar + top bar), for the admin tools.
export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <StaffShellLoader roles={AREA_ROLES.admin}>{children}</StaffShellLoader>
    </Suspense>
  );
}
