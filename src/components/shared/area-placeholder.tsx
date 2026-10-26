import { Stamp } from "@/components/ui/stamp";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { AREA_ROLES } from "@/lib/auth/roles";

type Area = keyof typeof AREA_ROLES;

// Placeholder for a role's home page until its phase is built. Checks the role
// on the server. Reads the session: render inside <Suspense>.
export async function AreaPlaceholder({ area }: { area: Area }) {
  await requireRole(AREA_ROLES[area]);
  const { t } = await getServerI18n();

  return (
    <section className="card-stock flex flex-col items-start gap-4 rounded-lg border border-rule p-8 shadow-[var(--shadow-card)]">
      <h1 className="text-3xl font-extrabold tracking-[-0.025em]">{t.dashboard[area].title}</h1>
      <p className="text-ink-label">{t.dashboard.placeholder}</p>
      <Stamp tone="upcoming" tilt={-4}>{t.common.tbd}</Stamp>
    </section>
  );
}
