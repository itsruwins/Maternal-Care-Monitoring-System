"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { login } from "../actions/login";
import type { LoginState } from "../types";

// Username + password form. Used in the login dialog and on /login.
export function LoginForm({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useDictionary();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = state.error
    ? format(t.auth.errors[state.error], { minutes: state.lockMinutes ?? 15 })
    : null;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-username">{t.auth.username}</Label>
        <Input
          id="login-username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={state.username}
          aria-invalid={Boolean(state.fieldErrors?.username)}
          aria-describedby={state.fieldErrors?.username ? "login-username-error" : undefined}
        />
        {state.fieldErrors?.username && (
          <p id="login-username-error" className="text-sm text-brick">
            {t.auth.errors[state.fieldErrors.username]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="login-password">{t.auth.password}</Label>
          <Link
            href="/forgot-password"
            onClick={onNavigate}
            className="text-sm text-press underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t.auth.forgot}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="pr-12"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? "login-password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-ink-label hover:text-ink"
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {state.fieldErrors?.password && (
          <p id="login-password-error" className="text-sm text-brick">
            {t.auth.errors[state.fieldErrors.password]}
          </p>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="rounded-md border border-brick/50 bg-brick/6 px-3 py-2.5 text-sm text-brick">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
        {pending && <LoaderCircle className="animate-spin" aria-hidden />}
        {pending ? t.auth.submitting : t.auth.submit}
      </Button>

      <p className="text-center text-sm text-ink-label">
        {t.auth.noAccount}{" "}
        <Link
          href="/register"
          onClick={onNavigate}
          className="font-semibold text-press underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          {t.auth.signupLink}
        </Link>
      </p>
    </form>
  );
}
