import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetLinkExpired, ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getServerI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return { title: t.reset.title };
}

// Reached from the email link (via /auth/callback, which signs the user in).
export default async function ResetPasswordPage() {
  const { t } = await getServerI18n();

  return (
    <AuthCard title={t.reset.title} subtitle={t.reset.subtitle}>
      <Suspense fallback={<p className="text-ink-soft">{t.common.loading}</p>}>
        <ResetGate />
      </Suspense>
    </AuthCard>
  );
}

// Only someone signed in through a valid reset link can set a new password.
async function ResetGate() {
  const user = await getCurrentUser();
  return user ? <ResetPasswordForm /> : <ResetLinkExpired />;
}
