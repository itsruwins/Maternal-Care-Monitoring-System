"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, DangerIcon, EmailIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { MAX_LENGTH } from "@/lib/validation/account-rules";
import { requestPasswordReset } from "../actions/password";
import type { ForgotPasswordState } from "../types";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";

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
    <form action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-5">
      {/* The card's subtitle, kept here so it goes away with the form once the email is sent
          (pulled up to sit 8px under the title, as AuthCard places a subtitle). */}
      <p className="-mt-5 mb-2 text-[0.95rem] leading-6 text-ink-soft">{t.forgot.subtitle}</p>
      <FormField id="forgot-identifier" label={t.forgot.identifier} error={state.error === "required" ? t.forgot.required : null}>
        {(describedBy) => (
          <InputIcon icon={UserIcon}>
            <Input
              id="forgot-identifier"
              name="identifier"
              maxLength={MAX_LENGTH.email}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={state.error === "required"}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      {state.error === "tooMany" && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {format(t.forgot.tooMany, { minutes: state.minutes ?? 60 })}
        </p>
      )}
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
