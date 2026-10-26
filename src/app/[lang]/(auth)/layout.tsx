import { BrandMark } from "@/components/shared/brand-mark";
import { LanguageSwitch } from "@/components/shared/language-switch";

// Account pages: the folder bar, then one card centered on the folder.
export default function AuthLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <BrandMark />
          <LanguageSwitch />
        </div>
      </header>
      <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </div>
  );
}
