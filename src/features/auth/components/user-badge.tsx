import { UserIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { format } from "@/i18n/format";
import { getServerI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";

// "Signed in as …" + log out. Reads the session: render inside <Suspense>.
export async function UserBadge() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { t } = await getServerI18n();

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden items-center gap-2 text-ink-soft sm:inline-flex">
        <IconCircle icon={UserIcon} tone="mint" size="sm" />
        {format(t.dashboard.signedInAs, { username: user.username })}
      </span>
      <LogoutButton />
    </div>
  );
}
