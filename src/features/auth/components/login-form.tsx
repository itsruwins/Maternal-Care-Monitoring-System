"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { login } from "../actions";
import type { LoginState } from "../types";

// Phase 0 test form: works end-to-end, but is unstyled on purpose.
// The designed login modal replaces it in Phase 1.
export function LoginForm() {
  const { t } = useDictionary();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = state.error
    ? format(t.auth.errors[state.error], { minutes: state.lockMinutes ?? 15 })
    : null;

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          {t.auth.username}
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          defaultValue={state.username}
          aria-invalid={Boolean(state.fieldErrors?.username)}
          aria-describedby={state.fieldErrors?.username ? "username-error" : undefined}
          className="rounded-md border px-3 py-2"
        />
        {state.fieldErrors?.username && (
          <p id="username-error" className="text-sm text-red-700">
            {t.auth.errors[state.fieldErrors.username]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          {t.auth.password}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
            className="w-full rounded-md border px-3 py-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {state.fieldErrors?.password && (
          <p id="password-error" className="text-sm text-red-700">
            {t.auth.errors[state.fieldErrors.password]}
          </p>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? t.auth.submitting : t.auth.submit}
      </button>
    </form>
  );
}
