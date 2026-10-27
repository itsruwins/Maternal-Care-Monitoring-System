"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PlusIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import { formatDate } from "@/lib/utils/pregnancy";
import { addClosedDay } from "../actions/closed-day";
import type { ClosedDayFormState } from "../types";

// "Add closed day": a date (today or later) and a reason.
export function ClosedDayDialog({ today }: { today: string }) {
  const { t, locale } = useDictionary();
  const c = t.closedDays;
  const d = c.dialog;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState<ClosedDayFormState, FormData>(async (previous, formData) => {
    const result = await addClosedDay(previous, formData);
    if (result.ok && result.date) {
      toast.success(format(d.added, { date: formatDate(result.date, locale) }));
      setOpen(false);
      setFormKey((k) => k + 1);
      router.refresh();
    }
    return result;
  }, {});
  const err = (field: "date" | "reason") => (state.fieldErrors?.[field] ? c.errors[state.fieldErrors[field]] : null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusIcon weight="bold" aria-hidden />
          {c.add}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{d.title}</DialogTitle>
          <DialogDescription>{d.subtitle}</DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          action={formAction}
          onSubmit={submitWithoutReset(formAction)}
          noValidate
          className="flex flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8"
        >
          <FormField id="closed-day-date" label={d.date} error={err("date")}>
            {(describedBy) => (
              <Input id="closed-day-date" name="date" type="date" min={today} aria-invalid={Boolean(err("date"))} aria-describedby={describedBy} className="max-w-56" />
            )}
          </FormField>
          <FormField id="closed-day-reason" label={d.reason} hint={d.reasonHint} error={err("reason")}>
            {(describedBy) => (
              <Input id="closed-day-reason" name="reason" maxLength={120} autoComplete="off" aria-invalid={Boolean(err("reason"))} aria-describedby={describedBy} />
            )}
          </FormField>
          {state.error && (
            <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
              <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
              {c.errors[state.error]}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              {d.cancel}
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
              {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
              {pending ? d.saving : d.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
