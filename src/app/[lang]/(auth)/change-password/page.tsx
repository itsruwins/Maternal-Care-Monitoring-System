import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import { getServerI18n } from "@/i18n/server";
import { ROLE_HOME } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return { title: t.newPassword.title };
}

// Forced after logging in with a default password (new staff account or a reset).
export default async function ChangePasswordPage() {
  const { t } = await getServerI18n();
  return (
    <AuthCard title={t.newPassword.title} subtitle={t.newPassword.subtitle}>
      <Suspense fallback={<p className="text-ink-soft">{t.common.loading}</p>}>
        <Gate />
      </Suspense>
    </AuthCard>
  );
}

// Only for a logged-in user who still has a default password.
async function Gate() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.mustChangePassword) redirect(ROLE_HOME[user.role]);
  return <NewPasswordForm />;
}
