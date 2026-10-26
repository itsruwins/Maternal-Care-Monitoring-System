import { Suspense } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { UserBadge } from "@/features/auth/components/user-badge";

// Phase 0/1 shell. The real dashboard layout (sidebar, bottom nav) comes in Phase 2.
export default function DashboardLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <BrandMark />
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <Suspense fallback={null}>
              <UserBadge />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
