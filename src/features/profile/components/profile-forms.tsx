"use client";

import { useActionState, useState, type ComponentProps } from "react";
import { toast } from "sonner";
import { DangerIcon, EmailIcon, LockIcon, PhoneIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { PurokSelect } from "@/components/shared/purok-select";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import type { PurokOption } from "@/lib/puroks/types";
import { changeMyEmail, changeMyPassword, updateMyDetails } from "../actions/update-profile";
import type { DetailsField, PasswordField } from "../schemas";
import type { MyProfile, ProfileErrorKey, ProfileFormState } from "../types";

function FormError({ error }: { error?: ProfileErrorKey }) {
  const { t } = useDictionary();
  if (!error) return null;
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
      <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
      {t.profile.errors[error]}
    </p>
  );
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <div>
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
        {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
        {pending ? pendingLabel : label}
      </Button>
    </div>
  );
}

// Your details: staff (name, mobile; position shown read-only) or mother
// (name, mobile, address, emergency contact).
export function DetailsForm({ profile, puroks }: { profile: MyProfile; puroks: PurokOption[] }) {
  const { t } = useDictionary();
  const p = t.profile.details;
  const f = t.register.fields;
  const [state, formAction, pending] = useActionState<ProfileFormState<DetailsField>, FormData>(async (previous, formData) => {
    const result = await updateMyDetails(previous, formData);
    if (result.ok) toast.success(p.saved);
    return result;
  }, {});
  const errors = state.fieldErrors ?? {};
  const err = (field: DetailsField) => (errors[field] ? t.profile.errors[errors[field]] : null);
  const d = profile.details;

  const text = (field: DetailsField, label: string, value: string | undefined, extra: ComponentProps<typeof Input> = {}, span = false) => (
    <FormField id={`me-${field}`} label={label} error={err(field)} className={span ? "sm:col-span-2" : undefined}>
      {(describedBy) => (
        <Input id={`me-${field}`} name={field} defaultValue={value} aria-invalid={Boolean(errors[field])} aria-describedby={describedBy} {...extra} />
      )}
    </FormField>
  );

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {text("firstName", f.firstName, d.firstName, { autoComplete: "given-name" })}
        {text("middleName", f.middleName, d.middleName, { autoComplete: "additional-name" })}
        {text("lastName", f.lastName, d.lastName, { autoComplete: "family-name" }, true)}
        <FormField id="me-contactNumber" label={f.contactNumber} hint={profile.kind === "mother" ? f.contactHint : undefined} error={err("contactNumber")} className="sm:col-span-2">
          {(describedBy) => (
            <InputIcon icon={PhoneIcon}>
              <Input
                id="me-contactNumber"
                name="contactNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={d.contactNumber}
                aria-invalid={Boolean(errors.contactNumber)}
                aria-describedby={describedBy}
                className="pl-11"
              />
            </InputIcon>
          )}
        </FormField>
        {profile.kind === "mother" ? (
          <>
            <FormField id="me-purokId" label={f.purok} error={err("purokId")}>
              {(describedBy) => (
                <PurokSelect
                  id="me-purokId"
                  name="purokId"
                  puroks={puroks}
                  placeholder={f.choosePurok}
                  defaultValue={d.purokId}
                  aria-invalid={Boolean(errors.purokId)}
                  aria-describedby={describedBy}
                />
              )}
            </FormField>
            {text("street", f.street, d.street, { autoComplete: "address-line1" })}
            {text("emergencyName", f.emergencyName, d.emergencyName)}
            {text("emergencyNumber", f.emergencyNumber, d.emergencyNumber, { type: "tel", inputMode: "tel" })}
          </>
        ) : (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm font-medium">{p.position}</span>
            <span className="text-base">{d.position || "—"}</span>
            <span className="text-sm text-ink-soft">{p.positionNote}</span>
          </div>
        )}
      </div>
      <FormError error={state.error} />
      <SubmitButton pending={pending} label={p.save} pendingLabel={p.saving} />
    </form>
  );
}

// Change password (current one checked first).
export function PasswordForm() {
  const { t } = useDictionary();
  const p = t.profile.password;
  // Changing the key clears the three fields after a successful change.
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState<ProfileFormState<PasswordField>, FormData>(async (previous, formData) => {
    const result = await changeMyPassword(previous, formData);
    if (result.ok) {
      toast.success(p.done);
      setFormKey((k) => k + 1);
    }
    return result;
  }, {});
  const errors = state.fieldErrors ?? {};
  const err = (field: PasswordField) => (errors[field] ? t.profile.errors[errors[field]] : null);
  const field = (name: PasswordField, label: string, autoComplete: string, hint?: string) => (
    <FormField id={`me-${name}`} label={label} hint={hint} error={err(name)}>
      {(describedBy) => (
        <InputIcon icon={LockIcon}>
          <Input
            id={`me-${name}`}
            name={name}
            type="password"
            autoComplete={autoComplete}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={describedBy}
            className="pl-11"
          />
        </InputIcon>
      )}
    </FormField>
  );

  return (
    <form key={formKey} action={formAction} noValidate className="flex flex-col gap-5">
      {field("current", p.current, "current-password")}
      {field("password", p.next, "new-password", t.register.fields.passwordHint)}
      {field("confirm", p.confirm, "new-password")}
      <FormError error={state.error} />
      <SubmitButton pending={pending} label={p.submit} pendingLabel={p.submitting} />
    </form>
  );
}

// Add or change the recovery email.
export function EmailForm({ email }: { email: string | null }) {
  const { t } = useDictionary();
  const p = t.profile.email;
  const [state, formAction, pending] = useActionState<ProfileFormState<"email">, FormData>(async (previous, formData) => {
    const result = await changeMyEmail(previous, formData);
    if (result.ok) toast.success(p.done);
    return result;
  }, {});
  const error = state.fieldErrors?.email;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <p className="text-[0.95rem] leading-6 text-ink-soft">{email ? format(p.current, { email }) : p.none}</p>
      <FormField id="me-email" label={p.label} error={error ? t.profile.errors[error] : null}>
        {(describedBy) => (
          <InputIcon icon={EmailIcon}>
            <Input
              id="me-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              defaultValue={email ?? ""}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      <FormError error={state.error} />
      <SubmitButton pending={pending} label={p.submit} pendingLabel={p.submitting} />
    </form>
  );
}
