"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, DangerIcon, InfoIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import { ServiceArt } from "@/components/shared/service-art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { doubleCheck, type VitalKey } from "@/lib/visits/vitals";
import { cn } from "@/lib/utils/cn";
import { recordVisit } from "../actions/record-visit";
import type { VisitContext, VisitErrorKey, VisitField, VisitInput, VisitService, VisitServiceEntry } from "../types";

type Vitals = Pick<VisitInput, VitalKey>;
const EMPTY: Vitals = { bpSystolic: "", bpDiastolic: "", weightKg: "", temperatureC: "", pulseRate: "", fundalHeightCm: "", fetalHeartRate: "" };
const toNumber = (value: string) => (value.trim() === "" ? null : Number(value.replace(",", ".")));

// Record a visit: vital signs (typos blocked; unusual values asked to be
// double-checked once), services given with details, and notes. Saving goes to
// the "Book next checkup" step.
export function VisitForm({ context, services }: { context: VisitContext; services: VisitService[] }) {
  const { t } = useDictionary();
  const f = t.visits.form;
  const router = useRouter();
  const [vitals, setVitals] = useState<Vitals>(EMPTY);
  const [entries, setEntries] = useState<VisitServiceEntry[]>(
    context.appointment ? [{ serviceId: context.appointment.serviceId, details: "", resultNotes: "" }] : [],
  );
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<VisitField, VisitErrorKey>>>({});
  const [formError, setFormError] = useState<VisitErrorKey | null>(null);
  // The unusual values she was already asked to check (saving again keeps them).
  const [acknowledged, setAcknowledged] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const numbers = useMemo(
    () => Object.fromEntries(Object.entries(vitals).map(([key, value]) => [key, toNumber(value)])) as Record<VitalKey, number | null>,
    [vitals],
  );
  const flagged = doubleCheck(numbers, { weeks: context.weeks, lastWeightKg: context.lastWeightKg });
  const flaggedKey = flagged.slice().sort().join(",");
  const showChecks = acknowledged !== null;

  const set = (key: VitalKey) => (value: string) => {
    setVitals((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleService = (id: number) =>
    setEntries((current) =>
      current.some((entry) => entry.serviceId === id)
        ? current.filter((entry) => entry.serviceId !== id)
        : [...current, { serviceId: id, details: "", resultNotes: "" }],
    );
  const updateEntry = (id: number, patch: Partial<VisitServiceEntry>) =>
    setEntries((current) => current.map((entry) => (entry.serviceId === id ? { ...entry, ...patch } : entry)));

  const save = () => {
    setFormError(null);
    // First save with unusual values: ask to check them; the next save keeps them.
    if (flagged.length && acknowledged !== flaggedKey) {
      setAcknowledged(flaggedKey);
      return;
    }
    startTransition(async () => {
      const result = await recordVisit({
        pregnancyId: context.pregnancyId,
        appointmentId: context.appointment?.id ?? null,
        ...vitals,
        notes,
        services: entries,
      });
      if (result.ok) {
        router.push(`/staff/visits/${result.visitId}/next`);
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error ?? null);
    });
  };

  const vitalField = (key: VitalKey, label: string, unit: string, opts: { hint?: string; decimal?: boolean } = {}) => (
    <Field
      id={`visit-${key}`}
      label={label}
      hint={opts.hint}
      error={errors[key] ? t.visits.errors[errors[key]] : null}
      note={showChecks && flagged.includes(key) ? f.doubleCheck : null}
    >
      {(describedBy) => (
        <UnitInput
          id={`visit-${key}`}
          unit={unit}
          value={vitals[key]}
          onChange={set(key)}
          decimal={opts.decimal}
          invalid={Boolean(errors[key])}
          describedBy={describedBy}
        />
      )}
    </Field>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Vital signs */}
      <section aria-labelledby="visit-vitals" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <h2 id="visit-vitals" className="text-lg font-bold">
          {f.vitals}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{f.vitalsHint}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <fieldset className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3 lg:max-w-xl">
            <legend className="mb-2 text-sm font-medium">{f.bp}</legend>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <UnitInput
                  id="visit-bpSystolic"
                  label={f.systolic}
                  unit=""
                  value={vitals.bpSystolic}
                  onChange={set("bpSystolic")}
                  invalid={Boolean(errors.bpSystolic)}
                  describedBy="visit-bp-hint"
                />
              </div>
              <span aria-hidden className="pt-2.5 text-2xl font-light text-ink-soft">
                /
              </span>
              <div className="flex-1">
                <UnitInput
                  id="visit-bpDiastolic"
                  label={f.diastolic}
                  unit="mmHg"
                  value={vitals.bpDiastolic}
                  onChange={set("bpDiastolic")}
                  invalid={Boolean(errors.bpDiastolic)}
                  describedBy="visit-bp-hint"
                />
              </div>
            </div>
            <p id="visit-bp-hint" className="text-sm text-ink-soft">
              {f.bpHint}
            </p>
            {(errors.bpSystolic || errors.bpDiastolic) && (
              <FieldMessage tone="error">{t.visits.errors[(errors.bpSystolic ?? errors.bpDiastolic)!]}</FieldMessage>
            )}
            {showChecks && (flagged.includes("bpSystolic") || flagged.includes("bpDiastolic")) && <FieldMessage tone="check">{f.doubleCheck}</FieldMessage>}
          </fieldset>
          {vitalField("weightKg", f.weight, f.weightUnit, {
            decimal: true,
            hint: context.lastWeightKg != null ? format(f.lastWeight, { kg: context.lastWeightKg }) : undefined,
          })}
          {vitalField("temperatureC", f.temperature, f.temperatureUnit, { decimal: true })}
          {vitalField("pulseRate", f.pulse, f.pulseUnit)}
          {vitalField("fundalHeightCm", f.fundal, f.fundalUnit, { decimal: true })}
          {vitalField("fetalHeartRate", f.fhr, f.fhrUnit)}
        </div>
      </section>

      {/* Services given */}
      <section aria-labelledby="visit-services" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <h2 id="visit-services" className="text-lg font-bold">
          {f.services}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{f.servicesHint}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {services.map((service) => {
            const on = entries.some((entry) => entry.serviceId === service.id);
            return (
              <li key={service.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pr-4 pl-1.5 text-[0.95rem] font-semibold transition-colors",
                    on ? "border-leaf bg-mint text-leaf" : "border-line bg-white text-ink hover:border-leaf hover:bg-mint/40",
                  )}
                >
                  <ServiceArt icon={service.icon} size="sm" className="size-8" />
                  {service.name}
                  {on && <CheckIcon weight="bold" aria-hidden className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
        {entries.length > 0 && (
          <ul className="mt-5 flex flex-col gap-3">
            {entries.map((entry) => {
              const service = services.find((s) => s.id === entry.serviceId);
              if (!service) return null;
              return (
                <li key={entry.serviceId} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 font-semibold">
                      <ServiceArt icon={service.icon} size="sm" className="size-8" />
                      {service.name}
                    </p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => toggleService(service.id)} aria-label={`${f.remove}: ${service.name}`}>
                      <TrashIcon weight="bold" aria-hidden />
                      {f.remove}
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`details-${service.id}`}>{f.details}</Label>
                      <Input
                        id={`details-${service.id}`}
                        value={entry.details}
                        onChange={(event) => updateEntry(service.id, { details: event.target.value })}
                        placeholder={f.detailsPlaceholder}
                        maxLength={120}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`result-${service.id}`}>{f.resultNotes}</Label>
                      <Input
                        id={`result-${service.id}`}
                        value={entry.resultNotes}
                        onChange={(event) => updateEntry(service.id, { resultNotes: event.target.value })}
                        maxLength={300}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Notes + save */}
      <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <div className="flex flex-col gap-2">
          <Label htmlFor="visit-notes">{f.notes}</Label>
          <Textarea id="visit-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} aria-describedby="visit-notes-hint" />
          <p id="visit-notes-hint" className="text-sm text-ink-soft">
            {f.notesHint}
          </p>
        </div>
        {showChecks && flagged.length > 0 && acknowledged === flaggedKey && (
          <p role="status" className="flex items-start gap-2.5 rounded-xl bg-cream px-4 py-3 text-sm leading-5 text-ink">
            <InfoIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0 text-leaf" />
            {f.checkNotice}
          </p>
        )}
        {formError && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
            <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
            {t.visits.errors[formError]}
          </p>
        )}
        <div>
          <Button type="button" onClick={save} disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
            {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
            {pending ? f.saving : f.save}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  note,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error: string | null;
  note: string | null;
  children: (describedBy: string | undefined) => ReactNode;
}) {
  const ids = [error && `${id}-error`, note && `${id}-note`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children(ids)}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <FieldMessage id={`${id}-error`} tone="error">
          {error}
        </FieldMessage>
      )}
      {note && !error && (
        <FieldMessage id={`${id}-note`} tone="check">
          {note}
        </FieldMessage>
      )}
    </div>
  );
}

function FieldMessage({ id, tone, children }: { id?: string; tone: "error" | "check"; children: ReactNode }) {
  return (
    <p id={id} className={cn("flex items-start gap-1.5 text-sm", tone === "error" ? "text-rose-deep" : "font-medium text-ink")}>
      {tone === "error" ? (
        <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0" />
      ) : (
        <InfoIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
      )}
      {children}
    </p>
  );
}

function UnitInput({
  id,
  label,
  unit,
  value,
  onChange,
  decimal,
  invalid,
  describedBy,
}: {
  id: string;
  /** Only for inputs without their own <Label>. */
  label?: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  decimal?: boolean;
  invalid: boolean;
  describedBy?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        aria-label={label}
        inputMode={decimal ? "decimal" : "numeric"}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, ""))}
        maxLength={6}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn("text-lg font-semibold", unit && "pr-24")}
      />
      {unit && <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-ink-soft">{unit}</span>}
    </div>
  );
}
