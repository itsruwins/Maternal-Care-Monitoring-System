import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { getServerI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/roles";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return { title: t.auth.loginTitle };
}

// Direct /login address (the landing page uses the login dialog instead).
export default async function LoginPage() {
  const { t } = await getServerI18n();

  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <AuthCard tab={t.landing.cardCenter} title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
        <LoginForm />
      </AuthCard>
    </>
  );
}

// Already logged in? Go straight to your own area.
async function RedirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role]);
  return null;
}
