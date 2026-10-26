"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
          <Input
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("password"))}
            aria-describedby={describedBy}
          />
        )}
      </FormField>
      <FormField id="reset-confirm" label={t.reset.confirm} error={fieldError("confirm")}>
        {(describedBy) => (
          <Input
            id="reset-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("confirm"))}
            aria-describedby={describedBy}
          />
        )}
      </FormField>
      {state.error === "generic" && (
        <p role="alert" className="rounded-md border border-brick/50 bg-brick/6 px-3 py-2.5 text-sm text-brick">
          {t.reset.errors.generic}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
        {pending && <LoaderCircle className="animate-spin" aria-hidden />}
        {pending ? t.reset.submitting : t.reset.submit}
      </Button>
    </form>
  );
}

export function ResetLinkExpired() {
  const { t } = useDictionary();
  return (
    <div className="flex flex-col gap-4" role="alert">
      <p className="leading-relaxed text-ink/85">{t.reset.expired}</p>
      <Button asChild className="self-start">
        <Link href="/forgot-password">{t.reset.requestNew}</Link>
      </Button>
    </div>
  );
}
