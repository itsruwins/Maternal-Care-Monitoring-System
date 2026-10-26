import { HeartIcon, PregnancyIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { format } from "@/i18n/format";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import type { UserRole } from "@/types/database";
import { getShellUser } from "../queries/get-shell-user";

// Home page greeting until each area's real home is built (staff: Phase 8
// dashboard; mother: Phase 3 pregnancy summary). Reads the session.
export async function Welcome({ roles, kind }: { roles: readonly UserRole[]; kind: "staff" | "mother" }) {
  const user = await requireRole(roles);
  const { firstName } = await getShellUser(user);
  const { t } = await getServerI18n();
  const copy = kind === "staff" ? t.shell.staffHome : t.shell.motherHome;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_120%_at_0%_0%,#f6e6e1_0%,#f2dfd6_55%,#eedfd2_100%)] p-8 sm:p-10">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1/2 -right-1/4 aspect-square w-3/4 rounded-full border-[24px] border-white/35"
      />
      <IconCircle icon={kind === "staff" ? HeartIcon : PregnancyIcon} tone="white" size="lg" className="relative text-rose-deep" />
      <h1 className="text-title relative mt-5 font-extrabold">{format(copy.greeting, { name: firstName })}</h1>
      <p className="relative mt-3 max-w-[56ch] text-lg leading-7 text-ink-soft">{copy.body}</p>
    </section>
  );
}
