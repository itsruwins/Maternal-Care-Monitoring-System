"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, EmailIcon, PlusIcon, SpinnerIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";
import { MAX_LENGTH } from "@/lib/validation/account-rules";
import { createStaffAccount } from "../actions/create-staff";
import type { CreateStaffField, FormState } from "../types";
import { StaffFields } from "./staff-fields";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";

// "New staff account": a dialog (bottom sheet on phones) with the account type,
// username (also the temporary password), name, position, mobile and optional email.
export function CreateStaffDialog() {
  const { t } = useDictionary();
  const c = t.accounts.create;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"HEALTH_WORKER" | "ADMIN">("HEALTH_WORKER");
  const [formKey, setFormKey] = useState(0);
  // Created: close, show the temporary password, refresh the list, reset the form.
  const [state, formAction, pending] = useActionState<FormState<CreateStaffField>, FormData>(async (previous, formData) => {
    const result = await createStaffAccount(previous, formData);
    if (result.ok && result.username) {
      toast.success(format(c.done, { username: result.username }), { duration: 10_000 });
      setOpen(false);
      setFormKey((k) => k + 1);
      setRole("HEALTH_WORKER");
      router.refresh();
    }
    return result;
  }, {});
  const errors = state.fieldErrors ?? {};
  const err = (field: CreateStaffField) => (errors[field] ? t.accounts.errors[errors[field]] : null);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon weight="bold" aria-hidden />
          {t.accounts.newStaff}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close} className="sm:max-w-2xl">
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.subtitle}</DialogDescription>
        </DialogHeader>
        <form key={formKey} action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8">
          {/* Account type */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{c.role}</legend>
            <input type="hidden" name="role" value={role} />
            <div role="radiogroup" aria-label={c.role} className="grid gap-2 sm:grid-cols-2">
              {(["HEALTH_WORKER", "ADMIN"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={role === value}
                  onClick={() => setRole(value)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-lg border text-[0.95rem] font-semibold transition-colors",
                    role === value ? "border-leaf bg-mint text-leaf" : "border-field bg-white text-ink-soft hover:border-ink-soft"
                  )}
                >
                  {value === "HEALTH_WORKER" ? c.roleHealthWorker : c.roleAdmin}
                </button>
              ))}
            </div>
          </fieldset>

          <FormField id="new-staff-username" label={c.username} hint={c.usernameHint} error={err("username")}>
            {(describedBy) => (
              <InputIcon icon={UserIcon}>
                <Input
                  id="new-staff-username"
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

          <StaffFields idPrefix="new-staff" errors={errors} />

          <FormField id="new-staff-email" label={c.email} hint={c.emailHint} error={err("email")}>
            {(describedBy) => (
              <InputIcon icon={EmailIcon}>
                <Input
                  id="new-staff-email"
                  name="email"
                  type="email"
                  maxLength={MAX_LENGTH.email}
                  inputMode="email"
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
              {t.accounts.errors[state.error]}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              {c.cancel}
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
              {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
              {pending ? c.submitting : c.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
