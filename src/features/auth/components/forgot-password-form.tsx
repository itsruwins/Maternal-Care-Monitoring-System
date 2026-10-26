"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { requestPasswordReset } from "../actions/password";
import type { ForgotPasswordState } from "../types";

export function ForgotPasswordForm() {
  const { t } = useDictionary();
  const [state, formAction, pending] = useActionState<ForgotPasswordState, FormData>(requestPasswordReset, {});

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <MailCheck className="size-9 text-stamp" aria-hidden />
        <h2 className="text-xl font-bold">{t.forgot.sentTitle}</h2>
        <p className="leading-relaxed text-ink/85">{t.forgot.sent}</p>
        <Button asChild variant="outline" className="mt-2 self-start">
          <Link href="/login">{t.forgot.back}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <FormField id="forgot-identifier" label={t.forgot.identifier} error={state.error ? t.forgot.required : null}>
        {(describedBy) => (
          <Input
            id="forgot-identifier"
            name="identifier"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(state.error)}
            aria-describedby={describedBy}
          />
        )}
      </FormField>
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
        {pending && <LoaderCircle className="animate-spin" aria-hidden />}
        {pending ? t.forgot.submitting : t.forgot.submit}
      </Button>
      <Link href="/login" className="self-center text-sm text-press underline decoration-1 underline-offset-4 hover:decoration-2">
        {t.forgot.back}
      </Link>
    </form>
  );
}
