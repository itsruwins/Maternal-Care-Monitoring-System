import { Suspense } from "react";
import { redirect } from "next/navigation";
import { lang } from "next/root-params";
import { LanguageSwitch } from "@/components/shared/language-switch";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/roles";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// Phase 0 test login page. Phase 1 adds the designed login modal.
export default async function LoginPage() {
  const locale = await lang();
  const t = await getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <LanguageSwitch />
      <div>
        <h1 className="text-2xl font-semibold">{t.auth.loginTitle}</h1>
        <p className="text-neutral-600">{t.auth.loginSubtitle}</p>
      </div>
      <LoginForm />
    </main>
  );
}

// Already logged in? Go straight to your own area.
async function RedirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role]);
  return null;
}
