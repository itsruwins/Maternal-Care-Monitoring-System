"use client";

import { IconCircle } from "@/components/ui/icon-circle";
import { useDictionary } from "@/i18n/dictionary-provider";
import type { PurokOption } from "@/lib/puroks/types";
import { formatDate } from "@/lib/utils/pregnancy";
import { REGISTER_STEPS, type RegisterInput } from "../schemas";
import { STEP_ICONS } from "./register-stepper";

// Step 5: everything she entered, grouped by step, each group editable.
export function RegisterReview({
  values,
  puroks,
  onEdit,
}: {
  values: RegisterInput;
  puroks: PurokOption[];
  onEdit: (step: number) => void;
}) {
  const { t, locale } = useDictionary();
  const f = t.register.fields;
  const date = (iso: string) => (iso ? formatDate(iso, locale) : t.common.notSet);
  const text = (value: string) => value.trim() || t.common.notSet;

  const groups: { step: number; rows: [string, string][] }[] = [
    {
      step: 0,
      rows: [
        [f.username, values.username.trim().toLowerCase()],
        [f.email, text(values.email)],
      ],
    },
    {
      step: 1,
      rows: [
        [f.firstName, text(values.firstName)],
        [f.middleName, text(values.middleName)],
        [f.lastName, text(values.lastName)],
        [f.dateOfBirth, date(values.dateOfBirth)],
        [f.contactNumber, text(values.contactNumber)],
      ],
    },
    {
      step: 2,
      rows: [
        [f.purok, puroks.find((purok) => String(purok.id) === values.purokId)?.name ?? t.common.notSet],
        [f.street, text(values.street)],
        [f.emergencyName, text(values.emergencyName)],
        [f.emergencyNumber, text(values.emergencyNumber)],
      ],
    },
    {
      step: 3,
      rows: [
        [f.gravidaHint, text(values.gravida)],
        [f.paraHint, text(values.para)],
        [f.lmp, date(values.lmp)],
        [f.edd, date(values.edd)],
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const key = REGISTER_STEPS[group.step].key;
        return (
          <section key={group.step} aria-labelledby={`review-${group.step}`} className="rounded-2xl bg-cream/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconCircle icon={STEP_ICONS[key]} tone="white" size="sm" weight="duotone" />
                <h3 id={`review-${group.step}`} className="text-base font-semibold">
                  {t.register.steps[key]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onEdit(group.step)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-leaf transition-colors hover:bg-white"
              >
                {t.register.buttons.edit}
              </button>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {group.rows.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-caption font-medium text-ink-soft">{label}</dt>
                  <dd className="tnum mt-0.5 text-[0.95rem] font-semibold break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
