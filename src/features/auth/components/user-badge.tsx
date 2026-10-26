import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { format } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";

// "Signed in as …" + log out. Reads the session: render inside <Suspense>.
export async function UserBadge() {
  const user = await getCurrentUser();
  if (!user) return null;

  const locale = await lang();
  const t = await getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{format(t.dashboard.signedInAs, { username: user.username })}</span>
      <LogoutButton />
    </div>
  );
}
