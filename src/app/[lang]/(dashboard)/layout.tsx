import { Suspense } from "react";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { SITE } from "@/config/site";
import { UserBadge } from "@/features/auth/components/user-badge";

// Phase 0 shell. The real dashboard layout (sidebar, bottom nav) comes in Phase 2.
export default function DashboardLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <span className="font-semibold">{SITE.name}</span>
        <div className="flex items-center gap-4">
          <LanguageSwitch />
          <Suspense fallback={null}>
            <UserBadge />
          </Suspense>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
