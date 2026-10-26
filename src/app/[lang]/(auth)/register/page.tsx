import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return { title: t.register.title };
}

export default async function RegisterPage() {
  const { t } = await getServerI18n();

  return (
    <div className="flex flex-col gap-6">
      <AuthCard tab={t.landing.cardTab} tabShort={t.landing.cardTabShort} title={t.register.title} subtitle={t.register.subtitle} wide bare>
        <RegisterForm />
      </AuthCard>
      <p className="text-center text-sm text-ink-label">
        {t.register.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-press underline decoration-1 underline-offset-4 hover:decoration-2">
          {t.register.login}
        </Link>
      </p>
    </div>
  );
}
