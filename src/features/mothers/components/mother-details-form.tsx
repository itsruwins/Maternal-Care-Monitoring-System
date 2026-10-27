"use client";

import { useActionState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CallIcon, DangerIcon, PhoneIcon, SpinnerIcon, type Icon } from "@/components/icons";
import { PurokSelect } from "@/components/shared/purok-select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import type { PurokOption } from "@/lib/puroks/types";
import { cn } from "@/lib/utils/cn";
import { updateMotherDetails } from "../actions/update-mother";
import type { MotherDetailsField } from "../schemas";
import type { FormState, MotherRecord } from "../types";

// Her details, editable by any health worker or admin.
export function MotherDetailsForm({ mother, puroks, today }: { mother: MotherRecord; puroks: PurokOption[]; today: string }) {
  const { t } = useDictionary();
  const f = t.register.fields;
  const d = t.mothers.record.details;
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState<MotherDetailsField>, FormData>(async (previous, formData) => {
    const result = await updateMotherDetails(mother.id, previous, formData);
    if (result.ok) {
      toast.success(d.saved);
      router.refresh();
    }
    return result;
  }, {});
  const errors = state.fieldErrors ?? {};
  const err = (field: MotherDetailsField) => (errors[field] ? t.mothers.errors[errors[field]] : null);

  const field = (
    name: MotherDetailsField,
    label: string,
    defaultValue: string,
    props: ComponentProps<typeof Input> = {},
    options: { hint?: string; icon?: Icon; span?: boolean } = {},
  ) => (
    <FormField id={`mother-${name}`} label={label} hint={options.hint} error={err(name)} className={options.span ? "sm:col-span-2" : undefined}>
      {(describedBy) => {
        const input = (
          <Input
            id={`mother-${name}`}
            name={name}
            defaultValue={defaultValue}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={describedBy}
            {...props}
            className={cn(options.icon && "pl-11", props.className)}
          />
        );
        return options.icon ? <InputIcon icon={options.icon}>{input}</InputIcon> : input;
      }}
    </FormField>
  );

  return (
    <form action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("firstName", f.firstName, mother.firstName, { autoComplete: "off" })}
        {field("middleName", f.middleName, mother.middleName, { autoComplete: "off" })}
        {field("lastName", f.lastName, mother.lastName, { autoComplete: "off" }, { span: true })}
        {field("dateOfBirth", f.dateOfBirth, mother.dateOfBirth, { type: "date", max: today })}
        {field("contactNumber", f.contactNumber, mother.contactNumber, { type: "tel", inputMode: "tel" }, { hint: t.mothers.register.contactHint, icon: PhoneIcon })}
        <FormField id="mother-purokId" label={f.purok} error={err("purokId")}>
          {(describedBy) => (
            <PurokSelect
              id="mother-purokId"
              name="purokId"
              puroks={puroks}
              placeholder={t.mothers.register.choosePurok}
              defaultValue={mother.purokId ? String(mother.purokId) : ""}
              aria-invalid={Boolean(errors.purokId)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
        {field("street", f.street, mother.street)}
        {field("emergencyName", f.emergencyName, mother.emergencyName)}
        {field("emergencyNumber", f.emergencyNumber, mother.emergencyNumber, { type: "tel", inputMode: "tel" }, { icon: CallIcon })}
      </div>
      {state.error && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {t.mothers.errors[state.error]}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
          {pending ? d.saving : d.save}
        </Button>
      </div>
    </form>
  );
}
