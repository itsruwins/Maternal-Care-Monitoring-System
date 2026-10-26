"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { addDays, dueDateFromLmp, isPlausibleLmp, parseISODate } from "@/lib/utils/pregnancy";
import { useToday } from "@/lib/utils/use-today";
import { cn } from "@/lib/utils/cn";
import { registerMother } from "../actions/register";
import { useUsernameAvailability } from "../hooks/use-username-availability";
import { REGISTER_STEPS, registerSchema, type RegisterData, type RegisterField, type RegisterInput } from "../schemas";
import { RegisterReview } from "./register-review";
import { RegisterStepper } from "./register-stepper";

const EMPTY: RegisterInput = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  contactNumber: "",
  purok: "",
  street: "",
  emergencyName: "",
  emergencyNumber: "",
  gravida: "",
  para: "",
  lmp: "",
  edd: "",
};

type ErrorKey = keyof ReturnType<typeof useDictionary>["t"]["register"]["errors"];

// Mother sign-up: 5 steps on one card. Each step is checked before moving on;
// everything is checked again on the server.
export function RegisterForm() {
  const { t } = useDictionary();
  const f = t.register.fields;
  const today = useToday();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [navigated, setNavigated] = useState(false);

  const form = useForm<RegisterInput, unknown, RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: EMPTY,
  });
  const { register, trigger, setValue, setError, getValues, getFieldState, formState } = form;
  const username = useWatch({ control: form.control, name: "username" });
  const lmp = useWatch({ control: form.control, name: "lmp" });
  const usernameStatus = useUsernameAvailability(username);

  // Prefill the last period date carried over from the landing card (?lmp=YYYY-MM-DD).
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("lmp") ?? "";
    if (parseISODate(value) && isPlausibleLmp(value)) setValue("lmp", value);
  }, [setValue]);

  // Fill the due date from the last period, unless she typed her own.
  useEffect(() => {
    if (!lmp || !isPlausibleLmp(lmp) || getFieldState("edd").isDirty) return;
    const due = dueDateFromLmp(lmp);
    if (due) setValue("edd", due, { shouldValidate: getFieldState("edd").isTouched });
  }, [lmp, setValue, getFieldState]);

  // Move focus to the new step's heading (for keyboard and screen reader users).
  useEffect(() => {
    if (navigated) headingRef.current?.focus();
  }, [step, navigated]);

  const errorText = (name: RegisterField) => {
    const key = formState.errors[name]?.message as ErrorKey | undefined;
    return key ? (t.register.errors[key] ?? t.register.errors.generic) : null;
  };

  const goTo = (next: number) => {
    setNavigated(true);
    setSubmitError(null);
    setStep(next);
  };

  const next = async () => {
    const fields = [...REGISTER_STEPS[step].fields] as RegisterField[];
    const ok = await trigger(fields, { shouldFocus: true });
    if (step === 0 && usernameStatus === "taken") {
      setError("username", { message: "usernameTaken" }, { shouldFocus: true });
      return;
    }
    if (ok) goTo(step + 1);
  };

  const submit = form.handleSubmit(
    () => {
      startSubmit(async () => {
        const result = await registerMother(getValues());
        // On success the server redirects to the mother's page; only failures return.
        if (result && !result.ok) {
          if (result.field) {
            goTo(0);
            setError(result.field, { message: result.error });
          } else {
            setSubmitError(t.register.errors[result.error === "invalid" ? "generic" : result.error]);
          }
        }
      });
    },
    // A problem left on an earlier step: go back to it.
    (errors) => {
      const firstBad = REGISTER_STEPS.findIndex((s) =>
        (s.fields as readonly RegisterField[]).some((name) => errors[name]),
      );
      if (firstBad >= 0) goTo(firstBad);
    },
  );

  const stepKey = REGISTER_STEPS[step].key;
  const isLast = step === REGISTER_STEPS.length - 1;

  // Builds the input for a FormField (which passes in its aria-describedby ids).
  const text = (name: RegisterField, props: React.ComponentProps<typeof Input> = {}) =>
    function renderInput(describedBy?: string) {
      return (
        <Input
          id={`reg-${name}`}
          aria-invalid={Boolean(formState.errors[name])}
          aria-describedby={describedBy}
          {...props}
          {...register(name)}
        />
      );
    };

  return (
    <form
      noValidate
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (isLast) void submit();
        else void next();
      }}
    >
      <RegisterStepper current={step} />

      <div className="px-6 pt-7 pb-8 sm:px-10">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-[-0.02em] outline-none">
          {stepKey === "review" ? t.register.review.title : t.register.steps[stepKey]}
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {stepKey === "account" && (
            <>
              <FormField
                id="reg-username"
                label={f.username}
                hint={f.usernameHint}
                error={errorText("username") ?? (usernameStatus === "taken" ? t.register.errors.usernameTaken : null)}
                status={<UsernameBadge status={usernameStatus} />}
                className="sm:col-span-2"
              >
                {text("username", {
                  autoComplete: "username",
                  autoCapitalize: "none",
                  autoCorrect: "off",
                  spellCheck: false,
                })}
              </FormField>
              <FormField id="reg-password" label={f.password} hint={f.passwordHint} error={errorText("password")}>
                {text("password", { type: "password", autoComplete: "new-password" })}
              </FormField>
              <FormField id="reg-confirmPassword" label={f.confirmPassword} error={errorText("confirmPassword")}>
                {text("confirmPassword", { type: "password", autoComplete: "new-password" })}
              </FormField>
              <FormField
                id="reg-email"
                label={f.email}
                hint={f.emailHint}
                error={errorText("email")}
                className="sm:col-span-2"
              >
                {text("email", { type: "email", autoComplete: "email", inputMode: "email" })}
              </FormField>
            </>
          )}

          {stepKey === "personal" && (
            <>
              <FormField id="reg-firstName" label={f.firstName} error={errorText("firstName")}>
                {text("firstName", { autoComplete: "given-name" })}
              </FormField>
              <FormField id="reg-middleName" label={f.middleName} error={errorText("middleName")}>
                {text("middleName", { autoComplete: "additional-name" })}
              </FormField>
              <FormField id="reg-lastName" label={f.lastName} error={errorText("lastName")}>
                {text("lastName", { autoComplete: "family-name" })}
              </FormField>
              <FormField id="reg-dateOfBirth" label={f.dateOfBirth} error={errorText("dateOfBirth")}>
                {text("dateOfBirth", { type: "date", autoComplete: "bday", max: today || undefined })}
              </FormField>
              <FormField
                id="reg-contactNumber"
                label={f.contactNumber}
                hint={f.contactHint}
                error={errorText("contactNumber")}
                className="sm:col-span-2"
              >
                {text("contactNumber", { type: "tel", inputMode: "tel", autoComplete: "tel" })}
              </FormField>
            </>
          )}

          {stepKey === "address" && (
            <>
              <FormField id="reg-purok" label={f.purok} error={errorText("purok")}>
                {text("purok")}
              </FormField>
              <FormField id="reg-street" label={f.street} error={errorText("street")}>
                {text("street", { autoComplete: "address-line1" })}
              </FormField>
              <FormField id="reg-emergencyName" label={f.emergencyName} error={errorText("emergencyName")}>
                {text("emergencyName")}
              </FormField>
              <FormField id="reg-emergencyNumber" label={f.emergencyNumber} error={errorText("emergencyNumber")}>
                {text("emergencyNumber", { type: "tel", inputMode: "tel" })}
              </FormField>
            </>
          )}

          {stepKey === "pregnancy" && (
            <>
              <FormField id="reg-gravida" label={f.gravida} hint={f.gravidaHint} error={errorText("gravida")}>
                {text("gravida", { inputMode: "numeric", maxLength: 2 })}
              </FormField>
              <FormField id="reg-para" label={f.para} hint={f.paraHint} error={errorText("para")}>
                {text("para", { inputMode: "numeric", maxLength: 2 })}
              </FormField>
              <FormField id="reg-lmp" label={f.lmp} hint={f.lmpHint} error={errorText("lmp")}>
                {text("lmp", {
                  type: "date",
                  min: today ? (addDays(today, -44 * 7) ?? undefined) : undefined,
                  max: today || undefined,
                })}
              </FormField>
              <FormField id="reg-edd" label={f.edd} hint={f.eddHint} error={errorText("edd")}>
                {text("edd", { type: "date", min: today ? (addDays(today, -14) ?? undefined) : undefined })}
              </FormField>
            </>
          )}
        </div>

        {stepKey === "review" && (
          <div className="mt-2">
            <RegisterReview values={getValues()} onEdit={goTo} />
          </div>
        )}

        {submitError && (
          <p role="alert" className="mt-6 rounded-md border border-brick/50 bg-brick/6 px-3 py-2.5 text-sm text-brick">
            {submitError}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-rule bg-folder/45 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} disabled={submitting}>
            <ArrowLeft aria-hidden />
            {t.register.buttons.back}
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button type="button" size="lg" onClick={submit} disabled={submitting} aria-busy={submitting}>
            {submitting ? <LoaderCircle className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            {submitting ? t.register.buttons.submitting : t.register.buttons.submit}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={next}>
            {t.register.buttons.next}
            <ArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </form>
  );
}

function UsernameBadge({ status }: { status: ReturnType<typeof useUsernameAvailability> }) {
  const { t } = useDictionary();
  if (status === "idle" || status === "taken") return null;
  return (
    <span
      aria-live="polite"
      className={cn(
        "label-print inline-flex items-center gap-1 text-[0.7rem]",
        status === "available" ? "text-stamp" : "text-ink-label",
      )}
    >
      {status === "checking" ? (
        <>
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          {t.register.fields.usernameChecking}
        </>
      ) : (
        <>
          <Check className="size-3.5" aria-hidden />
          {t.register.fields.usernameAvailable}
        </>
      )}
    </span>
  );
}
