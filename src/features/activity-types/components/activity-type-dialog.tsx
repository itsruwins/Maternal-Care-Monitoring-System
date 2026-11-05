"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, SpinnerIcon } from "@/components/icons";
import { ServiceIllustration } from "@/components/shared/service-illustration";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDictionary } from "@/i18n/dictionary-provider";
import { SERVICE_ICONS } from "@/lib/appointments/service-icons";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import { cn } from "@/lib/utils/cn";
import { saveActivityType } from "../actions/save-activity-type";
import type { ActivityTypeField } from "../schemas";
import type { ActivityType, ActivityTypeFormState } from "../types";
import { ReminderField } from "./reminder-field";

// Add (no `activityType`) or edit an activity type, opened by `trigger`.
// The title stays at the top and Cancel / Save at the bottom; only the middle
// scrolls (without a visible scrollbar). From 1024px it is wide, in two
// columns: name, description and reminder beside the picture grid, so it
// mostly fits without scrolling. Phones: one column, sliding up as a sheet.
export function ActivityTypeDialog({ activityType, trigger }: { activityType?: ActivityType; trigger: ReactNode }) {
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t.common.close} className="flex flex-col overflow-hidden sm:max-h-[min(90dvh,48rem)] sm:max-w-xl lg:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-line px-5 pt-5 pr-16 pb-4 sm:px-6 sm:pt-6 sm:pr-16 sm:pb-5">
          <DialogTitle>{editing ? d.editTitle : d.addTitle}</DialogTitle>
          <DialogDescription>{d.subtitle}</DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="no-scrollbar grid min-h-0 flex-1 gap-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8">
            <div className="flex flex-col gap-5">
              <FormField id={id("name")} label={d.name} error={err("name")}>
                {(describedBy) => (
                  <Input
                    id={id("name")}
                    name="name"
                    defaultValue={activityType?.name}
                    maxLength={80}
                    aria-invalid={Boolean(err("name"))}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
              <FormField id={id("description")} label={d.description} error={err("description")}>
                {(describedBy) => (
                  <Textarea
                    id={id("description")}
                    name="description"
                    rows={3}
                    defaultValue={activityType?.description ?? ""}
                    maxLength={300}
                    aria-invalid={Boolean(err("description"))}
                    aria-describedby={describedBy}
                    className="min-h-0 resize-none"
                  />
                )}
              </FormField>
              <ReminderField id={id("reminderDaysBefore")} defaultValue={activityType?.reminderDaysBefore ?? 1} error={err("reminderDaysBefore")} />
            </div>

            <fieldset className="flex min-w-0 flex-col gap-1 lg:border-l lg:border-line lg:pl-8">
              <legend className="text-sm font-medium">{d.icon}</legend>
              <p className="text-sm text-ink-soft">{d.iconHint}</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SERVICE_ICONS.map((key) => (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-line bg-white px-1 pt-1.5 pb-2 transition-colors select-none",
                      "hover:border-sage hover:bg-milk",
                      "has-checked:border-leaf has-checked:bg-mint/50 has-checked:shadow-[inset_0_0_0_1px_var(--color-leaf)]",
                      "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-leaf has-focus-visible:outline-solid",
                    )}
                  >
                    <input type="radio" name="icon" value={key} defaultChecked={key === (activityType?.icon ?? "checkup")} className="sr-only" />
                    <ServiceIllustration icon={key} className="w-[72%] mix-blend-multiply" />
                    <span className="text-center text-caption leading-tight text-ink-soft">{t.serviceIcons[key]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {state.error && (
              <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep lg:col-span-2">
                <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
                {a.errors[state.error]}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-milk px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
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
