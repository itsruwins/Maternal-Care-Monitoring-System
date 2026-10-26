"use client";

import { useActionState } from "react";
import { DangerIcon, InfoIcon, LockIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { setNewPassword } from "../actions/password";
import type { NewPasswordState } from "../types";

// First login with a default password: choose a new one to continue.
export function NewPasswordForm() {
  const { t } = useDictionary();
  const n = t.newPassword;
  const [state, formAction, pending] = useActionState<NewPasswordState, FormData>(setNewPassword, {});

  const fieldError = (field: "password" | "confirm") =>
    state.field === field && state.error ? n.errors[state.error] : null;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <p className="flex items-start gap-2.5 rounded-xl bg-mint px-4 py-3 text-sm leading-5 text-leaf">
        <InfoIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
        {n.note}
      </p>
      <FormField id="new-password" label={n.password} hint={t.register.fields.passwordHint} error={fieldError("password")}>
        {(describedBy) => (
          <InputIcon icon={LockIcon}>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldError("password"))}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      <FormField id="new-confirm" label={n.confirm} error={fieldError("confirm")}>
        {(describedBy) => (
          <InputIcon icon={LockIcon}>
            <Input
              id="new-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(fieldError("confirm"))}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      {state.error === "generic" && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {n.errors.generic}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
        {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
        {pending ? n.submitting : n.submit}
      </Button>
    </form>
  );
}
