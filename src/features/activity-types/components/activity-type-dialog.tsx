"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PencilIcon, PlusIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceIllustration } from "@/components/shared/service-illustration";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { SERVICE_ICONS } from "@/lib/appointments/service-icons";
import { saveActivityType } from "../actions/save-activity-type";
import { MAX_REMINDER_DAYS } from "../constants";
import type { ActivityTypeField } from "../schemas";
import type { ActivityType, ActivityTypeFormState } from "../types";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";

// Add (no `activityType`) or edit an activity type in a dialog.
export function ActivityTypeDialog({ activityType }: { activityType?: ActivityType }) {
  const { t } = useDictionary();
  const a = t.activityTypes;
  const d = a.dialog;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const editing = Boolean(activityType);

  const [state, formAction, pending] = useActionState<ActivityTypeFormState, FormData>(async (previous, formData) => {
    const result = await saveActivityType(activityType?.id ?? null, previous, formData);
    if (result.ok) {
      toast.success(editing ? d.saved : d.added);
      setOpen(false);
      setFormKey((k) => k + 1);
      router.refresh();
    }
    return result;
  }, {});
  const err = (field: ActivityTypeField) => (state.fieldErrors?.[field] ? a.errors[state.fieldErrors[field]] : null);
  const id = (field: string) => `activity-${activityType?.id ?? "new"}-${field}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="secondary" size="sm" aria-label={format(a.editName, { name: activityType!.name })}>
            <PencilIcon weight="bold" aria-hidden />
            {a.edit}
          </Button>
        ) : (
          <Button>
            <PlusIcon weight="bold" aria-hidden />
            {a.add}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{editing ? d.editTitle : d.addTitle}</DialogTitle>
          <DialogDescription>{d.subtitle}</DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8">
          <FormField id={id("name")} label={d.name} error={err("name")}>
            {(describedBy) => (
              <Input id={id("name")} name="name" defaultValue={activityType?.name} maxLength={80} aria-invalid={Boolean(err("name"))} aria-describedby={describedBy} />
            )}
          </FormField>
          <FormField id={id("description")} label={d.description} error={err("description")}>
            {(describedBy) => (
              <Input id={id("description")} name="description" defaultValue={activityType?.description ?? ""} maxLength={300} aria-describedby={describedBy} />
            )}
          </FormField>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">{d.icon}</legend>
            <p className="text-sm text-ink-soft">{d.iconHint}</p>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {SERVICE_ICONS.map((key) => (
                <label
                  key={key}
                  title={t.serviceIcons[key]}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-line px-1 py-2 transition-colors hover:bg-milk has-[:checked]:border-leaf has-[:checked]:bg-mint/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf"
                >
                  <input type="radio" name="icon" value={key} defaultChecked={key === (activityType?.icon ?? "checkup")} className="sr-only" />
                  <ServiceIllustration icon={key} className="w-16" />
                  <span className="text-center text-caption leading-tight text-ink-soft">{t.serviceIcons[key]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <FormField id={id("reminderDaysBefore")} label={d.reminder} hint={d.reminderHint} error={err("reminderDaysBefore")}>
            {(describedBy) => (
              <Input
                id={id("reminderDaysBefore")}
                name="reminderDaysBefore"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_REMINDER_DAYS}
                defaultValue={activityType?.reminderDaysBefore ?? 1}
                aria-invalid={Boolean(err("reminderDaysBefore"))}
                aria-describedby={describedBy}
                className="max-w-32"
              />
            )}
          </FormField>
          {state.error && (
            <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
              <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
              {a.errors[state.error]}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {d.cancel}
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
              {pending ? d.saving : d.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
