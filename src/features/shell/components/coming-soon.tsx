import { ComingSoonIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { format } from "@/i18n/format";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";
import type { NavKey } from "../nav";

// A page whose phase isn't built yet: its title and "Coming in Phase N".
// Checks the role first. Reads the session: render inside <Suspense>.
export async function ComingSoon({ roles, navKey, phase }: { roles: readonly UserRole[]; navKey: NavKey; phase: number }) {
  await requireRole(roles);
  const { t } = await getServerI18n();
  const c = t.shell.comingSoon;

  return (
    <section className="flex flex-col items-start gap-4 rounded-3xl bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
      <IconCircle icon={ComingSoonIcon} tone="beige" size="lg" weight="duotone" />
      <h1 className="text-title font-extrabold">{t.shell.nav[navKey]}</h1>
      <p className="max-w-[52ch] text-ink-soft">{format(c.body, { phase })}</p>
      <span className="rounded-full bg-beige px-3 py-1 text-sm font-semibold text-ink-soft">
        {c.title} · {format(c.badge, { phase })}
      </span>
    </section>
  );
}
