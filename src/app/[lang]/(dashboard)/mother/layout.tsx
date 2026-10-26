import { Suspense } from "react";
import { MotherShellLoader, ShellSkeleton } from "@/features/shell/components/shell-loaders";

// The mother portal shell (top menu; bottom tab bar on phones).
export default function MotherLayout({ children }: LayoutProps<"/[lang]/mother">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <MotherShellLoader>{children}</MotherShellLoader>
    </Suspense>
  );
}
