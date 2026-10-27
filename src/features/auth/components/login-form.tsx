"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { DangerIcon, EyeIcon, EyeSlashIcon, LockIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { login } from "../actions/login";
import type { LoginState } from "../types";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";

// Username + password form. Used in the auth dialog and on /login.
// onNavigate: close the dialog when a link leaves it. onSwitchToSignup: show
// the sign-up form in the same dialog (on /login it links to /register).
export function LoginForm({
  onNavigate,
  onSwitchToSignup,
}: {
  onNavigate?: () => void;
  onSwitchToSignup?: () => void;
}) {
  const { t } = useDictionary();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = state.error
    ? format(t.auth.errors[state.error], { minutes: state.lockMinutes ?? 15 })
    : null;

  return (
    <form action={formAction} onSubmit={submitWithoutReset(formAction)} className="flex flex-col gap-5" noValidate>
      <FormField
        id="login-username"
        label={t.auth.username}
        error={state.fieldErrors?.username ? t.auth.errors[state.fieldErrors.username] : null}
      >
        {(describedBy) => (
          <InputIcon icon={UserIcon}>
            <Input
              id="login-username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              defaultValue={state.username}
              aria-invalid={Boolean(state.fieldErrors?.username)}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>

      <FormField
        id="login-password"
        label={t.auth.password}
        error={state.fieldErrors?.password ? t.auth.errors[state.fieldErrors.password] : null}
        status={
          <Link
            href="/forgot-password"
            onClick={onNavigate}
            className="text-sm font-medium text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t.auth.forgot}
          </Link>
        }
      >
        {(describedBy) => (
          <InputIcon icon={LockIcon}>
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-12 pl-11"
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby={describedBy}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-cream hover:text-ink"
            >
              {showPassword ? <EyeSlashIcon className="size-5" aria-hidden /> : <EyeIcon className="size-5" aria-hidden />}
            </button>
          </InputIcon>
        )}
      </FormField>

      {errorMessage && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="mt-1 w-full">
        {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
        {pending ? t.auth.submitting : t.auth.submit}
      </Button>

      <p className="text-center text-sm text-ink-soft">
        {t.auth.noAccount}{" "}
        {onSwitchToSignup ? (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t.auth.signupLink}
          </button>
        ) : (
          <Link
            href="/register"
            onClick={onNavigate}
            className="font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t.auth.signupLink}
          </Link>
        )}
      </p>
    </form>
  );
}
