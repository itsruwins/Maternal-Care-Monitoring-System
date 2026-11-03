import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return { title: t.forgot.title };
}

export default async function ForgotPasswordPage() {
  const { t } = await getServerI18n();

  return (
    <AuthCard title={t.forgot.title}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
