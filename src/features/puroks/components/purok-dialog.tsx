"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PencilIcon, PlusIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { savePurok } from "../actions/save-purok";
import type { Purok, PurokFormState } from "../types";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";

// Add (no `purok`) or rename a purok in a dialog.
export function PurokDialog({ purok }: { purok?: Purok }) {
  const { t } = useDictionary();
  const p = t.puroks;
  const d = p.dialog;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const editing = Boolean(purok);

  const [state, formAction, pending] = useActionState<PurokFormState, FormData>(async (previous, formData) => {
    const result = await savePurok(purok?.id ?? null, previous, formData);
    if (result.ok) {
      toast.success(editing ? d.saved : d.added);
      setOpen(false);
      setFormKey((k) => k + 1);
      router.refresh();
    }
    return result;
  }, {});
  const nameError = state.fieldErrors?.name ? p.errors[state.fieldErrors.name] : null;
  const id = `purok-${purok?.id ?? "new"}-name`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="secondary" size="sm" aria-label={format(p.renameName, { name: purok!.name })}>
            <PencilIcon weight="bold" aria-hidden />
            {p.rename}
          </Button>
        ) : (
          <Button className="w-full sm:w-auto">
            <PlusIcon weight="bold" aria-hidden />
            {p.add}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{editing ? d.renameTitle : d.addTitle}</DialogTitle>
          <DialogDescription>{d.subtitle}</DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8">
          <FormField id={id} label={d.name} error={nameError}>
            {(describedBy) => (
              <Input
                id={id}
                name="name"
                defaultValue={purok?.name}
                maxLength={60}
                autoComplete="off"
                aria-invalid={Boolean(nameError)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
          {state.error && (
            <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
              <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
              {p.errors[state.error]}
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
