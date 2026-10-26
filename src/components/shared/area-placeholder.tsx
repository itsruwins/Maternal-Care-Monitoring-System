import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireRole } from "@/lib/auth/session";
import { AREA_ROLES } from "@/lib/auth/roles";

type Area = keyof typeof AREA_ROLES;

// Phase 0 placeholder for a role's home page. Checks the role on the server.
// Reads the session: render inside <Suspense>.
export async function AreaPlaceholder({ area }: { area: Area }) {
  await requireRole(AREA_ROLES[area]);
  const locale = await lang();
  const t = await getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">{t.dashboard[area].title}</h1>
      <p className="text-neutral-600">{t.dashboard.placeholder}</p>
    </section>
  );
}
