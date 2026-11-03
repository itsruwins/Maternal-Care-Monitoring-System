"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, EmailIcon, InfoIcon, LockIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { StatusBadge } from "@/features/accounts/components/badges";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import { formatDateTime } from "@/lib/utils/date-time";
import { MAX_LENGTH } from "@/lib/validation/account-rules";
import { createLoginForMother, resetMotherPassword, setMotherLoginStatus, type CreateLoginState } from "../actions/mother-login";
import type { MotherActionResult, MotherLogin } from "../types";

// Her login: details with Reset password and Activate / Deactivate, or a small
// "Create login" form when she has none.
export function MotherLoginCard({ motherId, login }: { motherId: number; login: MotherLogin | null }) {
  return login ? <LoginDetails motherId={motherId} login={login} /> : <CreateLoginForm motherId={motherId} />;
}

function CreateLoginForm({ motherId }: { motherId: number }) {
  const { t } = useDictionary();
  const l = t.mothers.record.login;
  const r = t.mothers.register;
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CreateLoginState, FormData>(async (previous, formData) => {
    const result = await createLoginForMother(motherId, previous, formData);
    if (result.ok && result.username) {
      toast.success(format(l.created, { username: result.username }), { duration: 10_000 });
      router.refresh();
    }
    return result;
  }, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-5">
      <div>
        <p className="font-semibold">{l.none}</p>
        <p className="mt-1 text-sm text-ink-soft">{l.noneHint}</p>
      </div>
      <FormField id="mother-login-username" label={r.username} hint={r.usernameHint} error={errors.username ? t.mothers.errors[errors.username] : null}>
        {(describedBy) => (
          <InputIcon icon={UserIcon}>
            <Input
              id="mother-login-username"
              name="username"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      <FormField id="mother-login-email" label={r.email} hint={r.emailHint} error={errors.email ? t.mothers.errors[errors.email] : null}>
        {(describedBy) => (
          <InputIcon icon={EmailIcon}>
            <Input
              id="mother-login-email"
              name="email"
              type="email"
              maxLength={MAX_LENGTH.email}
              autoComplete="off"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
              className="pl-11"
            />
          </InputIcon>
        )}
      </FormField>
      {state.error && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {t.mothers.errors[state.error]}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
          {pending ? l.creating : l.create}
        </Button>
      </div>
    </form>
  );
}

function LoginDetails({ motherId, login }: { motherId: number; login: MotherLogin }) {
  const { t, locale } = useDictionary();
  const l = t.mothers.record.login;
  const router = useRouter();
  const [confirm, setConfirm] = useState<"reset" | "status" | null>(null);
  const [running, startRunning] = useTransition();
  const deactivating = login.status === "ACTIVE";

  const run = (action: () => Promise<MotherActionResult>, success: (result: Extract<MotherActionResult, { ok: true }>) => string) =>
    startRunning(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success(result), { duration: 8_000 });
        setConfirm(null);
        router.refresh();
      } else {
        toast.error(t.mothers.errors[result.error]);
      }
    });

  const rows: [string, React.ReactNode][] = [
    [l.username, <span key="u" className="font-semibold">@{login.username}</span>],
    [l.status, <StatusBadge key="s" status={login.status} label={login.status === "ACTIVE" ? l.active : l.inactive} />],
    [l.lastLogin, login.lastLoginAt ? formatDateTime(login.lastLoginAt, locale) : l.never],
    [l.email, login.email ?? l.noEmail],
  ];

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-[0.95rem]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="min-w-0 break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {login.mustChangePassword && (
        <p className="flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">
          <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          {l.pendingPassword}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" onClick={() => setConfirm("reset")} className="w-full sm:w-auto">
          <LockIcon weight="bold" aria-hidden />
          {l.reset}
        </Button>
        <Button type="button" variant={deactivating ? "destructive" : "soft"} onClick={() => setConfirm("status")} className="w-full sm:w-auto">
          {deactivating ? l.deactivate : l.activate}
        </Button>
      </div>

      <Dialog open={confirm !== null} onOpenChange={(open) => !open && !running && setConfirm(null)}>
        <DialogContent closeLabel={t.common.close}>
          <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
            <DialogTitle>{confirm === "reset" ? l.resetTitle : deactivating ? l.deactivateTitle : l.activateTitle}</DialogTitle>
            <DialogDescription>
              {confirm === "reset" ? format(l.resetBody, { username: login.username }) : deactivating ? l.deactivateBody : l.activateBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 pt-4 sm:px-8 sm:pb-8">
            <Button type="button" variant="ghost" onClick={() => setConfirm(null)} disabled={running}>
              {l.cancel}
            </Button>
            <Button
              type="button"
              variant={confirm === "status" && deactivating ? "destructive" : "default"}
              disabled={running}
              aria-busy={running}
              onClick={() =>
                confirm === "reset"
                  ? run(() => resetMotherPassword(motherId), (result) => format(l.resetDone, { username: result.username ?? login.username }))
                  : run(() => setMotherLoginStatus(motherId, deactivating ? "INACTIVE" : "ACTIVE"), () => l.statusDone)
              }
            >
              {running && <SpinnerIcon className="animate-spin" aria-hidden />}
              {confirm === "reset" ? l.reset : deactivating ? l.deactivate : l.activate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
