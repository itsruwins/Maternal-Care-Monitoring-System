import { EmailIcon, LockIcon, PregnancyIcon, UserIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";
import { getMyProfile } from "../queries/get-my-profile";
import type { MyProfile } from "../types";
import { DetailsForm, EmailForm, PasswordForm } from "./profile-forms";

// Your profile (staff and mothers): who you are, then your details, password
// and recovery email. Reads the session: render inside <Suspense>.
export async function ProfileScreen({ roles }: { roles: readonly UserRole[] }) {
  const user = await requireRole(roles);
  const { t } = await getServerI18n();
  const profile = await getMyProfile(user);
  return <ProfileView t={t} profile={profile} role={user.role} />;
}

// The page layout, without data loading (also used by the dev preview).
export function ProfileView({ t, profile, role }: { t: Dictionary; profile: MyProfile; role: UserRole }) {
  const p = t.profile;
  const name = [profile.details.firstName, profile.details.lastName].filter(Boolean).join(" ") || profile.username;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <IconCircle icon={profile.kind === "mother" ? PregnancyIcon : UserIcon} tone={profile.kind === "mother" ? "blush" : "mint"} size="lg" />
        <div className="min-w-0">
          <h1 className="text-title font-extrabold break-words">{name}</h1>
          <p className="mt-1 text-ink-soft">
            {t.shell.roles[role]} · @{profile.username}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="details-title" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 id="details-title" className="text-xl font-bold">{p.details.title}</h2>
          <div className="mt-5">
            <DetailsForm profile={profile} />
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="password-title" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-center gap-3">
              <IconCircle icon={LockIcon} tone="mint" size="sm" />
              <h2 id="password-title" className="text-xl font-bold">{p.password.title}</h2>
            </div>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </section>
          <section aria-labelledby="email-title" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-center gap-3">
              <IconCircle icon={EmailIcon} tone="blush" size="sm" />
              <h2 id="email-title" className="text-xl font-bold">{p.email.title}</h2>
            </div>
            <div className="mt-5">
              <EmailForm email={profile.email} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
