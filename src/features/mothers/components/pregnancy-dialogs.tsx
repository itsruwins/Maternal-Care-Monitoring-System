"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PencilIcon, PlusIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import { dueDateFromLmp, formatDate, parseISODate } from "@/lib/utils/pregnancy";
import { closePregnancy, savePastPregnancy, saveCurrentPregnancy } from "../actions/pregnancy";
import { OUTCOMES } from "../constants";
import type { FormState, MotherErrorKey, PregnancyRecord } from "../types";

type Errors = Partial<Record<string, MotherErrorKey>>;

// The three pregnancy dialogs on a mother's record: start or edit the current
// pregnancy, close it with an outcome, and add or edit a past one.

/** Start a new pregnancy (no `pregnancy`) or edit the current one. */
export function CurrentPregnancyDialog({ motherId, pregnancy, today }: { motherId: number; pregnancy?: PregnancyRecord; today: string }) {
  const { t } = useDictionary();
  const p = t.mothers.record.pregnancy;
  const f = t.register.fields;
  const editing = Boolean(pregnancy);
  const [lmp, setLmp] = useState(pregnancy?.lmp ?? "");
  const [edd, setEdd] = useState(pregnancy?.edd ?? "");
  const [eddEdited, setEddEdited] = useState(editing);

  return (
    <PregnancyDialog
      trigger={
        editing ? (
          <Button variant="secondary" size="sm">
            <PencilIcon weight="bold" aria-hidden />
            {p.edit}
          </Button>
        ) : (
          <Button>
            <PlusIcon weight="bold" aria-hidden />
            {p.start}
          </Button>
        )
      }
      title={editing ? p.editTitle : p.startTitle}
      submitLabel={p.save}
      successMessage={editing ? p.saved : p.started}
      action={(previous, formData) => saveCurrentPregnancy(motherId, pregnancy?.id ?? null, previous, formData)}
    >
      {(errors, idFor) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="gravida" label={f.gravida} hint={f.gravidaHint} errors={errors} idFor={idFor} defaultValue={pregnancy?.gravida} inputMode="numeric" maxLength={2} />
            <TextField name="para" label={f.para} hint={f.paraHint} errors={errors} idFor={idFor} defaultValue={pregnancy?.para} inputMode="numeric" maxLength={2} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="lmp"
              label={t.mothers.register.lmp}
              hint={t.mothers.register.lmpHint}
              errors={errors}
              idFor={idFor}
              type="date"
              max={today}
              value={lmp}
              onChange={(value) => {
                setLmp(value);
                if (!eddEdited && parseISODate(value)) setEdd(dueDateFromLmp(value) ?? "");
              }}
            />
            <TextField
              name="edd"
              label={f.edd}
              hint={t.mothers.register.eddHint}
              errors={errors}
              idFor={idFor}
              type="date"
              value={edd}
              onChange={(value) => {
                setEdd(value);
                setEddEdited(true);
              }}
            />
          </div>
          <TextField name="remarks" label={p.remarksOptional} errors={errors} idFor={idFor} defaultValue={pregnancy?.remarks ?? ""} maxLength={300} />
        </>
      )}
    </PregnancyDialog>
  );
}

/** Close the current pregnancy with its outcome and date. */
export function ClosePregnancyDialog({ motherId, pregnancy, today }: { motherId: number; pregnancy: PregnancyRecord; today: string }) {
  const { t } = useDictionary();
  const p = t.mothers.record.pregnancy;
  return (
    <PregnancyDialog
      trigger={
        <Button variant="outline" size="sm">
          {p.close}
        </Button>
      }
      title={p.closeTitle}
      description={p.closeBody}
      submitLabel={p.closeSubmit}
      successMessage={p.closed}
      action={(previous, formData) => closePregnancy(motherId, pregnancy.id, previous, formData)}
    >
      {(errors, idFor) => (
        <>
          <OutcomeField errors={errors} idFor={idFor} />
          <TextField name="outcomeDate" label={p.outcomeDate} errors={errors} idFor={idFor} type="date" max={today} defaultValue={today} />
          <TextField name="remarks" label={p.remarksOptional} errors={errors} idFor={idFor} defaultValue={pregnancy.remarks ?? ""} maxLength={300} />
        </>
      )}
    </PregnancyDialog>
  );
}

/** Add a past pregnancy (no `pregnancy`) or edit one. */
export function PastPregnancyDialog({ motherId, pregnancy, today }: { motherId: number; pregnancy?: PregnancyRecord; today: string }) {
  const { t, locale } = useDictionary();
  const p = t.mothers.record.pregnancy;
  const f = t.register.fields;
  const editing = Boolean(pregnancy);
  return (
    <PregnancyDialog
      trigger={
        editing ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label={pregnancy?.outcomeDate ? format(p.editPastName, { date: formatDate(pregnancy.outcomeDate, locale) }) : undefined}
          >
            <PencilIcon weight="bold" aria-hidden />
            {p.editPast}
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            <PlusIcon weight="bold" aria-hidden />
            {p.addPast}
          </Button>
        )
      }
      title={editing ? p.editPastTitle : p.pastTitle}
      description={p.pastBody}
      submitLabel={p.save}
      successMessage={editing ? p.saved : p.added}
      action={(previous, formData) => savePastPregnancy(motherId, pregnancy?.id ?? null, previous, formData)}
    >
      {(errors, idFor) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <OutcomeField errors={errors} idFor={idFor} defaultValue={pregnancy?.outcome ?? ""} />
            <TextField name="outcomeDate" label={p.outcomeDate} errors={errors} idFor={idFor} type="date" max={today} defaultValue={pregnancy?.outcomeDate ?? ""} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="gravida" label={f.gravidaHint} errors={errors} idFor={idFor} defaultValue={pregnancy?.gravida} inputMode="numeric" maxLength={2} />
            <TextField name="para" label={f.paraHint} errors={errors} idFor={idFor} defaultValue={pregnancy?.para} inputMode="numeric" maxLength={2} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="lmp" label={p.lmpOptional} errors={errors} idFor={idFor} type="date" max={today} defaultValue={pregnancy?.lmp ?? ""} />
            <TextField name="edd" label={p.eddOptional} errors={errors} idFor={idFor} type="date" defaultValue={pregnancy?.edd ?? ""} />
          </div>
          <TextField name="remarks" label={p.remarksOptional} errors={errors} idFor={idFor} defaultValue={pregnancy?.remarks ?? ""} maxLength={300} />
        </>
      )}
    </PregnancyDialog>
  );
}

// --- Shared pieces ---------------------------------------------------------------

function PregnancyDialog({
  trigger,
  title,
  description,
  submitLabel,
  successMessage,
  action,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  submitLabel: string;
  successMessage: string;
  action: (previous: FormState<string>, formData: FormData) => Promise<FormState<string>>;
  children: (errors: Errors, idFor: (name: string) => string) => ReactNode;
}) {
  const { t } = useDictionary();
  const p = t.mothers.record.pregnancy;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState<FormState<string>, FormData>(async (previous, formData) => {
    const result = await action(previous, formData);
    if (result.ok) {
      toast.success(successMessage);
      setOpen(false);
      setFormKey((k) => k + 1);
      router.refresh();
    }
    return result;
  }, {});
  const prefix = `pregnancy-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t.common.close} className="sm:max-w-xl">
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        <form
          key={formKey}
          action={formAction}
          onSubmit={submitWithoutReset(formAction)}
          noValidate
          className="flex flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8"
        >
          {children(state.fieldErrors ?? {}, (name) => `${prefix}-${name}`)}
          {state.error && (
            <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
              <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
              {t.mothers.errors[state.error]}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              {p.cancel}
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
              {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
              {pending ? p.saving : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TextField({
  name,
  label,
  hint,
  errors,
  idFor,
  onChange,
  ...props
}: {
  name: string;
  label: string;
  hint?: string;
  errors: Errors;
  idFor: (name: string) => string;
  onChange?: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "name" | "onChange">) {
  const { t } = useDictionary();
  const error = errors[name] ? t.mothers.errors[errors[name]] : null;
  const id = idFor(name);
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(describedBy) => (
        <Input
          id={id}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          {...props}
        />
      )}
    </FormField>
  );
}

function OutcomeField({ errors, idFor, defaultValue = "" }: { errors: Errors; idFor: (name: string) => string; defaultValue?: string }) {
  const { t } = useDictionary();
  const p = t.mothers.record.pregnancy;
  const error = errors.outcome ? t.mothers.errors[errors.outcome] : null;
  const id = idFor("outcome");
  return (
    <FormField id={id} label={p.outcome} error={error}>
      {(describedBy) => (
        <NativeSelect id={id} name="outcome" defaultValue={defaultValue} aria-invalid={Boolean(error)} aria-describedby={describedBy}>
          <option value="">{p.chooseOutcome}</option>
          {OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {p.outcomes[outcome]}
            </option>
          ))}
        </NativeSelect>
      )}
    </FormField>
  );
}
