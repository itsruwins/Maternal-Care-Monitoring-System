import { notFound } from "next/navigation";
import { BrandMark } from "@/components/shared/brand-mark";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import { getServerI18n } from "@/i18n/server";

export const metadata = { title: "Change password preview", robots: { index: false } };

// Development only: the forced first-login password screen (no session).
export default async function ChangePasswordPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const { t } = await getServerI18n();
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <BrandMark />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 outline-none flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        <AuthCard title={t.newPassword.title} subtitle={t.newPassword.subtitle}>
          <div className="flex flex-col gap-4">
            <NewPasswordForm />
            <LogoutButton />
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
