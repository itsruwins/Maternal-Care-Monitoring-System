"use client";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { formatDate } from "@/lib/utils/pregnancy";
import { REGISTER_STEPS, type RegisterInput } from "../schemas";

// Step 5: everything she entered, grouped by step, each group editable.
export function RegisterReview({ values, onEdit }: { values: RegisterInput; onEdit: (step: number) => void }) {
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
        [f.purok, text(values.purok)],
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
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.step} aria-labelledby={`review-${group.step}`} className="rounded-md border border-rule bg-paper/60">
          <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2.5">
            <h3 id={`review-${group.step}`} className="label-print text-[0.75rem]">
              {t.register.steps[REGISTER_STEPS[group.step].key]}
            </h3>
            <Button type="button" variant="link" size="sm" onClick={() => onEdit(group.step)}>
              {t.register.buttons.edit}
            </Button>
          </div>
          <dl>
            {group.rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-rule/70 px-4 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
                <dt className="text-sm text-ink-label">{label}</dt>
                <dd className="hand tnum text-lg break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
