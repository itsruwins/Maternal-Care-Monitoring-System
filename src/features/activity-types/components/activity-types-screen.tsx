import { InfoIcon, PencilIcon, PlusIcon, ReminderIcon } from "@/components/icons";
import { ServiceIllustration } from "@/components/shared/service-illustration";
import { Button } from "@/components/ui/button";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { listActivityTypes } from "../queries/list-activity-types";
import type { ActivityType } from "../types";
import { ActivityTypeDialog } from "./activity-type-dialog";

// /admin/activity-types: one picture tile per service (the picture mothers
// see when they request a visit, its name, description and reminder timing),
// the whole tile opening Edit; a dashed "Add activity type" tile closes the
// grid. Reads the session.
export async function ActivityTypesScreen() {
  await requireRole(["ADMIN"]);
  const { t } = await getServerI18n();
  const types = await listActivityTypes();
  return <ActivityTypesView t={t} types={types} />;
}

// The page layout, without data loading (also used by the dev preview).
export function ActivityTypesView({ t, types }: { t: Dictionary; types: ActivityType[] }) {
  const a = t.activityTypes;
  const reminder = (days: number) => (days === 0 ? a.reminderSameDay : days === 1 ? a.reminderOneDay : format(a.reminderDays, { days }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-title font-extrabold tracking-[-0.01em]">{a.title}</h1>
          <p className="mt-2 max-w-[60ch] text-ink-soft">{a.intro}</p>
        </div>
        <ActivityTypeDialog
          trigger={
            <Button className="max-sm:w-full">
              <PlusIcon weight="bold" aria-hidden />
              {a.add}
            </Button>
          }
        />
      </div>

      {/* Phones: a row per service. From 640px: tiles, as many across as fit
          (at least 15rem each), every row the same height (the Add tile too),
          each tile's reminder and a pencil (Edit) along its bottom; the whole
          tile opens Edit. */}
      <ul className="grid grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] sm:gap-6">
        {types.map((type) => (
          <li
            key={type.id}
            className="group relative flex rounded-3xl bg-white shadow-[var(--shadow-soft)] transition-[box-shadow,translate] duration-300 ease-[var(--ease-out-expo)] hover:shadow-[var(--shadow-raised)] max-sm:items-center max-sm:gap-4 max-sm:p-4 sm:flex-col sm:hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-milk max-sm:size-20 sm:m-3 sm:mb-0 sm:aspect-[4/3]">
              <ServiceIllustration
                icon={type.icon}
                // Multiply: the picture's white ground takes on the panel's milk.
                className="mix-blend-multiply max-sm:w-16 sm:w-[58%]"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col sm:px-5 sm:pt-4 sm:pb-5">
              <h2 className="text-lg leading-6 font-semibold break-words">{type.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink-soft">{type.description || a.noDescription}</p>
              <div className="mt-3 flex items-center justify-between gap-2 sm:mt-auto sm:pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-caption font-semibold whitespace-nowrap text-leaf">
                  <ReminderIcon aria-hidden className="size-3.5 shrink-0" />
                  <span className="sr-only">{a.reminderLabel}: </span>
                  {reminder(type.reminderDaysBefore)}
                </span>
                <ActivityTypeDialog
                  activityType={type}
                  trigger={
                    // The tile is the target: its ::after covers the whole card.
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      aria-label={format(a.editName, { name: type.name })}
                      title={a.edit}
                      className="static shrink-0 after:absolute after:inset-0 after:rounded-3xl after:content-['']"
                    >
                      <PencilIcon weight="bold" aria-hidden className="size-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </li>
        ))}
        <li className="max-sm:hidden">
          <ActivityTypeDialog
            trigger={
              <button
                type="button"
                className="flex size-full min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-sage/70 px-6 text-center transition-colors duration-200 hover:border-leaf hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-mint text-leaf">
                  <PlusIcon weight="bold" aria-hidden className="size-5" />
                </span>
                <span className="font-semibold text-leaf">{a.add}</span>
                <span className="max-w-[24ch] text-sm text-ink-soft">{a.addHint}</span>
              </button>
            }
          />
        </li>
      </ul>

      <p className="flex items-start gap-2 text-sm text-ink-soft">
        <InfoIcon weight="regular" aria-hidden className="mt-0.5 size-4 shrink-0" />
        {a.noDelete}
      </p>
    </div>
  );
}
