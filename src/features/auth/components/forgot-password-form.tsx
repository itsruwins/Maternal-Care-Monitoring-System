"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, EmailIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { requestPasswordReset } from "../actions/password";
import type { ForgotPasswordState } from "../types";

export function ForgotPasswordForm() {
  const { t } = useDictionary();
  const [state, formAction, pending] = useActionState<ForgotPasswordState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="flex flex-col items-start gap-3" role="status">
        <IconCircle icon={EmailIcon} tone="mint" size="lg" weight="duotone" />
        <h2 className="mt-1 text-xl font-bold">{t.forgot.sentTitle}</h2>
        <p className="text-[0.95rem] leading-6 text-ink-soft">{t.forgot.sent}</p>
        <Button asChild variant="secondary" className="mt-3">
          <Link href="/login">
            <ArrowLeftIcon weight="bold" aria-hidden />
            {t.forgot.back}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <FormField id="forgot-identifier" label={t.forgot.identifier} error={state.error ? t.forgot.required : null}>
        {(describedBy) => (
          <InputIcon icon={UserIcon}>
            <Input
              id="forgot-identifier"
              name="identifier"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(state.error)}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
        {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
        {pending ? t.forgot.submitting : t.forgot.submit}
      </Button>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 self-center text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <ArrowLeftIcon weight="bold" aria-hidden className="size-4" />
        {t.forgot.back}
      </Link>
    </form>
  );
}
