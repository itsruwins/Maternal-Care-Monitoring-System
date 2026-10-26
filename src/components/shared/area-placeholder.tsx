import { DashboardIcon, MothersIcon, PregnancyIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { AREA_ROLES } from "@/lib/auth/roles";

type Area = keyof typeof AREA_ROLES;

const AREA_ICON: Record<Area, Icon> = {
  admin: DashboardIcon,
  staff: MothersIcon,
  mother: PregnancyIcon,
};

// Placeholder for a role's home page until its phase is built. Checks the role
// on the server. Reads the session: render inside <Suspense>.
export async function AreaPlaceholder({ area }: { area: Area }) {
  await requireRole(AREA_ROLES[area]);
  const { t } = await getServerI18n();

  return (
    <section className="flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
      <IconCircle icon={AREA_ICON[area]} tone={area === "mother" ? "blush" : "mint"} size="lg" />
      <h1 className="text-title font-extrabold">{t.dashboard[area].title}</h1>
      <p className="text-ink-soft">{t.dashboard.placeholder}</p>
      <span className="rounded-full bg-beige px-3 py-1 text-sm font-semibold text-ink-soft">{t.common.tbd}</span>
    </section>
  );
}
