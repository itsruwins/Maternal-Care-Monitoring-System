"use client";

import { useActionState, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import {
  CallIcon,
  CheckCircleIcon,
  DangerIcon,
  EmailIcon,
  HomeIcon,
  PhoneIcon,
  PregnancyIcon,
  ProfileIcon,
  SpinnerIcon,
  UserIcon,
  type Icon,
} from "@/components/icons";
import { PurokSelect } from "@/components/shared/purok-select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { submitWithoutReset } from "@/lib/forms/submit-without-reset";
import type { PurokOption } from "@/lib/puroks/types";
import { cn } from "@/lib/utils/cn";
import { dueDateFromLmp, parseISODate } from "@/lib/utils/pregnancy";
import { inputMaxLength } from "@/lib/validation/account-rules";
import { registerMotherAtCenter, type RegisterMotherState } from "../actions/register-mother";
import type { RegisterMotherField } from "../schemas";

// "Register a mother" at the health center: her details, address, current
// pregnancy and an optional login. After saving it shows who was registered
// (and her temporary password), with "Register another".
export function RegisterMother({ puroks, today }: { puroks: PurokOption[]; today: string }) {
  const [round, setRound] = useState(0);
  return <RegisterMotherForm key={round} puroks={puroks} today={today} onAnother={() => setRound((r) => r + 1)} />;
}

function RegisterMotherForm({ puroks, today, onAnother }: { puroks: PurokOption[]; today: string; onAnother: () => void }) {
  const { t } = useDictionary();
  const f = t.register.fields;
  const r = t.mothers.register;
  const [state, formAction, pending] = useActionState<RegisterMotherState, FormData>(registerMotherAtCenter, {});
  const [lmp, setLmp] = useState("");
  const [edd, setEdd] = useState("");
  const [eddEdited, setEddEdited] = useState(false);
  const [createLogin, setCreateLogin] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed save, move to the first field that needs fixing.
  useEffect(() => {
    if (state.fieldErrors) formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [state]);


  const errors = state.fieldErrors ?? {};
  const err = (field: RegisterMotherField) => (errors[field] ? t.mothers.errors[errors[field]] : null);
  const id = (field: RegisterMotherField) => `new-mother-${field}`;
  const field = (
    name: RegisterMotherField,
    label: string,
    props: ComponentProps<typeof Input> = {},
    options: { hint?: string; icon?: Icon; span?: boolean } = {},
  ) => (
    <FormField id={id(name)} label={label} hint={options.hint} error={err(name)} className={options.span ? "sm:col-span-2" : undefined}>
      {(describedBy) => {
        const input = (
          <Input
            id={id(name)}
            name={name}
            maxLength={inputMaxLength(name)}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={describedBy}
            {...props}
            className={cn(options.icon && "pl-11", props.className)}
          />
        );
        return options.icon ? <InputIcon icon={options.icon}>{input}</InputIcon> : input;
      }}
    </FormField>
  );

  if (state.ok && state.registered) {
    const done = state.registered;
    return (
      <section className="flex flex-col items-start gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-raised)] sm:p-8" aria-live="polite">
        <IconCircle icon={CheckCircleIcon} tone="mint" size="lg" />
        <div>
          <h2 className="text-xl font-bold">{format(r.doneTitle, { name: done.name })}</h2>
          <p className="mt-1 text-ink-soft">{r.doneBody}</p>
        </div>
        <p className="rounded-xl bg-milk px-4 py-3 text-[0.95rem] leading-6">
          {done.username ? format(r.doneLogin, { username: done.username }) : r.doneNoLogin}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/staff/mothers/${done.motherId}`}>{format(t.mothers.record.open, { name: done.name })}</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/staff/mothers">{r.doneBack}</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={onAnother} className="w-full sm:w-auto">
            {r.doneAnother}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={submitWithoutReset(formAction)} noValidate className="flex flex-col gap-6">
      <Section icon={ProfileIcon} tone="blush" title={r.sections.about}>
        {field("firstName", f.firstName, { autoComplete: "off" })}
        {field("middleName", f.middleName, { autoComplete: "off" })}
        {field("lastName", f.lastName, { autoComplete: "off" }, { span: true })}
        {field("dateOfBirth", f.dateOfBirth, { type: "date", max: today })}
        {field("contactNumber", f.contactNumber, { type: "tel", inputMode: "tel" }, { hint: r.contactHint, icon: PhoneIcon })}
      </Section>

      <Section icon={HomeIcon} tone="beige" title={r.sections.address}>
        <FormField id={id("purokId")} label={f.purok} error={err("purokId")}>
          {(describedBy) => (
            <PurokSelect
              id={id("purokId")}
              name="purokId"
              puroks={puroks}
              placeholder={r.choosePurok}
              defaultValue=""
              aria-invalid={Boolean(errors.purokId)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
        {field("street", f.street)}
        {field("emergencyName", f.emergencyName)}
        {field("emergencyNumber", f.emergencyNumber, { type: "tel", inputMode: "tel" }, { icon: CallIcon })}
      </Section>

      <Section icon={PregnancyIcon} tone="blush" title={r.sections.pregnancy}>
        {field("gravida", f.gravida, { inputMode: "numeric", maxLength: 2, className: "max-w-32" }, { hint: f.gravidaHint })}
        {field("para", f.para, { inputMode: "numeric", maxLength: 2, className: "max-w-32" }, { hint: f.paraHint })}
        {field(
          "lmp",
          r.lmp,
          {
            type: "date",
            max: today,
            value: lmp,
            onChange: (event) => {
              const next = event.target.value;
              setLmp(next);
              // Fill the due date from the LMP until someone types their own.
              if (!eddEdited && parseISODate(next)) setEdd(dueDateFromLmp(next) ?? "");
            },
          },
          { hint: r.lmpHint },
        )}
        {field(
          "edd",
          f.edd,
          {
            type: "date",
            value: edd,
            onChange: (event) => {
              setEdd(event.target.value);
              setEddEdited(true);
            },
          },
          { hint: r.eddHint },
        )}
      </Section>

      <Section icon={UserIcon} tone="mint" title={r.sections.login}>
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors sm:col-span-2",
            createLogin ? "border-leaf bg-mint/50" : "border-line hover:bg-milk",
          )}
        >
          <input
            type="checkbox"
            name="createLogin"
            checked={createLogin}
            onChange={(event) => setCreateLogin(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-leaf"
          />
          <span className="flex flex-col gap-1">
            <span className="font-semibold">{r.createLogin}</span>
            <span className="text-sm text-ink-soft">{r.createLoginHint}</span>
          </span>
        </label>
        {createLogin && (
          <>
            {field("username", r.username, { autoComplete: "off", autoCapitalize: "none", spellCheck: false }, { hint: r.usernameHint, icon: UserIcon })}
            {field("email", r.email, { type: "email", autoComplete: "off" }, { hint: r.emailHint, icon: EmailIcon })}
          </>
        )}
      </Section>

      {state.error && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {t.mothers.errors[state.error]}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="ghost" className="w-full sm:w-auto">
          <Link href="/staff/mothers">{r.cancel}</Link>
        </Button>
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
          {pending ? r.submitting : r.submit}
        </Button>
      </div>
    </form>
  );
}

function Section({
  icon,
  tone,
  title,
  children,
}: {
  icon: Icon;
  tone: "mint" | "blush" | "beige";
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden className="mb-5 flex items-center gap-3">
        <IconCircle icon={icon} tone={tone} size="sm" />
        <span className="text-lg font-bold">{title}</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
