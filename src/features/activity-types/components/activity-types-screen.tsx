import {
  ActivityTypesIcon,
  CheckupIcon,
  EducationIcon,
  InfoIcon,
  LabTestIcon,
  ReminderIcon,
  SupplementIcon,
  VaccineIcon,
  type Icon,
} from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { listActivityTypes } from "../queries/list-activity-types";
import type { ActivityType } from "../types";
import { ActivityTypeDialog } from "./activity-type-dialog";

// An icon that fits the service name (the same icons as the landing page).
function iconFor(name: string): Icon {
  const n = name.toLowerCase();
  if (n.includes("prenatal") || n.includes("checkup")) return CheckupIcon;
  if (n.includes("tetanus") || n.includes("vaccin")) return VaccineIcon;
  if (n.includes("iron") || n.includes("folic") || n.includes("supplement")) return SupplementIcon;
  if (n.includes("lab")) return LabTestIcon;
  if (n.includes("education") || n.includes("class") || n.includes("session")) return EducationIcon;
  return ActivityTypesIcon;
}
const TONES = ["mint", "blush", "beige"] as const;

// /admin/activity-types: one card per service with its reminder timing, an
// Edit button each, and "Add activity type". Reads the session.
export async function ActivityTypesScreen() {
  await requireRole(["ADMIN"]);
  const { t } = await getServerI18n();
  const types = await listActivityTypes();
  return <ActivityTypesView t={t} types={types} />;
}

// The page layout, without data loading (also used by the dev preview).
export function ActivityTypesView({ t, types }: { t: Dictionary; types: ActivityType[] }) {
  const a = t.activityTypes;
  const reminder = (days: number) =>
    days === 0 ? a.reminderSameDay : days === 1 ? a.reminderOneDay : format(a.reminderDays, { days });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{a.title}</h1>
          <p className="mt-2 max-w-[56ch] text-ink-soft">{a.intro}</p>
        </div>
        <ActivityTypeDialog />
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {types.map((type, index) => (
          <li key={type.id} className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex items-start gap-4">
              <IconCircle icon={iconFor(type.name)} tone={TONES[index % TONES.length]} />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg leading-6 font-semibold break-words">{type.name}</h2>
                <p className="mt-1 text-[0.95rem] leading-6 text-ink-soft">{type.description || a.noDescription}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf">
                <ReminderIcon weight="fill" aria-hidden className="size-4" />
                {reminder(type.reminderDaysBefore)}
              </span>
              <ActivityTypeDialog activityType={type} />
            </div>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2 text-sm text-ink-soft">
        <InfoIcon weight="regular" aria-hidden className="mt-0.5 size-4 shrink-0" />
        {a.noDelete}
      </p>
    </div>
  );
}
