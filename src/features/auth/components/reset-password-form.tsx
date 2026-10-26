"use client";

import { useActionState } from "react";
import Link from "next/link";
import { DangerIcon, LockIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { updatePassword } from "../actions/password";
import type { ResetPasswordState } from "../types";

export function ResetPasswordForm() {
  const { t } = useDictionary();
  const [state, formAction, pending] = useActionState<ResetPasswordState, FormData>(updatePassword, {});

  if (state.error === "expired") return <ResetLinkExpired />;

  const fieldError = (field: "password" | "confirm") =>
    state.field === field && (state.error === "passwordShort" || state.error === "passwordMismatch")
      ? t.reset.errors[state.error]
      : null;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <FormField id="reset-password" label={t.reset.password} hint={t.register.fields.passwordHint} error={fieldError("password")}>
        {(describedBy) => (
          <InputIcon icon={LockIcon}>
            <Input
              id="reset-password"
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
      <FormField id="reset-confirm" label={t.reset.confirm} error={fieldError("confirm")}>
        {(describedBy) => (
          <InputIcon icon={LockIcon}>
            <Input
              id="reset-confirm"
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
          {t.reset.errors.generic}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
        {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
        {pending ? t.reset.submitting : t.reset.submit}
      </Button>
    </form>
  );
}

export function ResetLinkExpired() {
  const { t } = useDictionary();
  return (
    <div className="flex flex-col items-start gap-3" role="alert">
      <IconCircle icon={DangerIcon} tone="blush" size="lg" />
      <p className="mt-1 text-[0.95rem] leading-6 text-ink-soft">{t.reset.expired}</p>
      <Button asChild className="mt-2">
        <Link href="/forgot-password">{t.reset.requestNew}</Link>
      </Button>
    </div>
  );
}
