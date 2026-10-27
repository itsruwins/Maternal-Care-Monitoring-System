import { InfoIcon, LocationIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { StatusBadge } from "@/features/accounts/components/badges";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";
import { listPuroks } from "../queries/list-puroks";
import type { Purok } from "../types";
import { PurokDialog } from "./purok-dialog";
import { PurokVisibilityButton } from "./purok-visibility-button";

// /admin/puroks: the purok list with Rename and Hide / Show on each row, and
// "Add purok". Reads the session: render inside <Suspense>.
export async function PuroksScreen() {
  await requireRole(["ADMIN"]);
  const { t } = await getServerI18n();
  const puroks = await listPuroks();
  return <PuroksView t={t} puroks={puroks} />;
}

// The page layout, without data loading (also used by the dev preview).
export function PuroksView({ t, puroks }: { t: Dictionary; puroks: Purok[] }) {
  const p = t.puroks;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{p.title}</h1>
          <p className="mt-2 max-w-[60ch] text-ink-soft">{p.intro}</p>
        </div>
        <PurokDialog />
      </div>

      {puroks.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{p.empty}</p>
      ) : (
        <section aria-label={p.title} className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">{format(p.count, { count: puroks.length })}</p>
          <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]">
            {puroks.map((purok) => (
              <li key={purok.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                {/* Phones: name and badge on one line, the actions below it. */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <IconCircle icon={LocationIcon} tone={purok.isActive ? "mint" : "beige"} size="sm" />
                  <span className={cn("min-w-0 text-[0.95rem] font-semibold break-words", !purok.isActive && "text-ink-soft")}>
                    {purok.name}
                  </span>
                  {/* Only the exception is marked: shown is the normal state. */}
                  {!purok.isActive && (
                    <span className="shrink-0">
                      <StatusBadge status="INACTIVE" label={p.hidden} />
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PurokDialog purok={purok} />
                  <PurokVisibilityButton purok={purok} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2 text-sm text-ink-soft">
        <p className="flex items-start gap-2">
          <InfoIcon weight="regular" aria-hidden className="mt-0.5 size-4 shrink-0" />
          {p.hiddenNote}
        </p>
        <p className="flex items-start gap-2">
          <InfoIcon weight="regular" aria-hidden className="mt-0.5 size-4 shrink-0" />
          {p.noDelete}
        </p>
      </div>
    </div>
  );
}
