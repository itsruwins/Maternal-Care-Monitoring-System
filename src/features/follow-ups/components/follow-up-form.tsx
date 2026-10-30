"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { DangerIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cn } from "@/lib/utils/cn";
import { logFollowUp, updateFollowUp } from "../actions/follow-ups";
import { CLOSE_REASONS, FOLLOW_UP_METHODS, FOLLOW_UP_RESULTS, NOTES_MAX, type FollowUpField } from "../schemas";
import type { FollowUpEntry, FollowUpErrorKey } from "../types";
import { METHOD_ICONS } from "./follow-up-bits";

export type SavedFollowUp = { reached: boolean; closing: boolean };

// Log a new follow-up for a missed appointment, or change one (`entry`).
// The date starts at today; the database rejects future dates and dates
// before the missed visit.
export function FollowUpForm({
  appointmentId,
  missedDate,
  today,
  entry,
  onSaved,
  onCancel,
}: {
  appointmentId: number;
  missedDate: string;
  today: string;
  entry?: FollowUpEntry;
  onSaved: (saved: SavedFollowUp) => void;
  onCancel: () => void;
}) {
  const { t } = useDictionary();
  const f = t.followUps;
  const form = f.form;
  const [method, setMethod] = useState<string>(entry?.method ?? "");
  const [result, setResult] = useState<string>(entry?.result ?? "");
  const [date, setDate] = useState(entry?.date ?? today);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [closing, setClosing] = useState(Boolean(entry?.closeReason));
  const [reason, setReason] = useState<string>(entry?.closeReason ?? "");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FollowUpField, FollowUpErrorKey>>>({});
  const [error, setError] = useState<FollowUpErrorKey | null>(null);
  const [pending, startTransition] = useTransition();
  const id = (field: string) => `follow-up-${entry?.id ?? `new-${appointmentId}`}-${field}`;
  const err = (field: FollowUpField) => (fieldErrors[field] ? t.followUpErrors[fieldErrors[field]] : null);
  const clear = (field: FollowUpField) => setFieldErrors((current) => ({ ...current, [field]: undefined }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = { method, date, result, notes, closeReason: closing ? reason : null };
    // The quick checks here; the server and the database check everything again.
    const missing: Partial<Record<FollowUpField, FollowUpErrorKey>> = {};
    if (!method) missing.method = "method_required";
    if (!result) missing.result = "result_required";
    if (closing && !reason) missing.closeReason = "reason_required";
    if (reason === "OTHER" && closing && !notes.trim()) missing.notes = "close_note_required";
    if (Object.keys(missing).length) {
      setFieldErrors(missing);
      setError(null);
      return;
    }
    startTransition(async () => {
      const response = entry ? await updateFollowUp(entry.id, values) : await logFollowUp(appointmentId, values);
      if (response.ok) {
        onSaved({ reached: result === "REACHED", closing });
      } else {
        setFieldErrors(response.fieldErrors ?? {});
        setError(response.error ?? null);
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8">
      <Choices
        id={id("method")}
        legend={form.method}
        error={err("method")}
        columns="grid-cols-3"
        options={FOLLOW_UP_METHODS.map((value) => {
          const MethodIcon = METHOD_ICONS[value];
          return {
            value,
            label: (
              <span className="flex flex-col items-center gap-1.5 text-center">
                <MethodIcon weight="duotone" aria-hidden className="size-6 text-leaf" />
                <span className="text-sm leading-tight font-semibold">{f.methods[value]}</span>
              </span>
            ),
          };
        })}
        value={method}
        onChange={(value) => {
          setMethod(value);
          clear("method");
        }}
      />
      <Choices
        id={id("result")}
        legend={form.result}
        error={err("result")}
        columns="grid-cols-2"
        options={FOLLOW_UP_RESULTS.map((value) => ({ value, label: <span className="text-[0.95rem] font-semibold">{f.outcomes[value]}</span> }))}
        value={result}
        onChange={(value) => {
          setResult(value);
          clear("result");
        }}
      />
      <FormField id={id("date")} label={form.date} error={err("date")}>
        {(describedBy) => (
          <Input
            id={id("date")}
            type="date"
            value={date}
            min={missedDate}
            max={today}
            onChange={(event) => {
              setDate(event.target.value);
              clear("date");
            }}
            aria-invalid={Boolean(err("date"))}
            aria-describedby={describedBy}
            className="max-w-56"
          />
        )}
      </FormField>
      <FormField id={id("notes")} label={form.notes} hint={form.notesHint} error={err("notes")}>
        {(describedBy) => (
          <Textarea
            id={id("notes")}
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              clear("notes");
            }}
            maxLength={NOTES_MAX}
            rows={3}
            aria-invalid={Boolean(err("notes"))}
            aria-describedby={describedBy}
          />
        )}
      </FormField>

      <div className="flex flex-col gap-3">
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
            closing ? "border-leaf bg-mint/50" : "border-line hover:bg-milk",
          )}
        >
          <input
            type="checkbox"
            checked={closing}
            onChange={(event) => {
              setClosing(event.target.checked);
              clear("closeReason");
            }}
            className="mt-0.5 size-5 shrink-0 accent-leaf"
          />
          <span className="flex flex-col gap-1">
            <span className="font-semibold">{form.close}</span>
            <span className="text-sm text-ink-soft">{form.closeHint}</span>
          </span>
        </label>
        {closing && (
          <Choices
            id={id("reason")}
            legend={form.reason}
            error={err("closeReason")}
            columns="grid-cols-1 sm:grid-cols-3"
            options={CLOSE_REASONS.map((value) => ({ value, label: <span className="text-sm font-semibold">{f.closeReasons[value]}</span> }))}
            value={reason}
            onChange={(value) => {
              setReason(value);
              clear("closeReason");
              clear("notes");
            }}
          />
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {t.followUpErrors[error]}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending} className="w-full sm:w-auto">
          {form.cancel}
        </Button>
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
          {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
          {pending ? form.saving : entry ? form.saveChanges : form.save}
        </Button>
      </div>
    </form>
  );
}

// A row of big radio tiles (one choice).
function Choices({
  id,
  legend,
  error,
  columns,
  options,
  value,
  onChange,
}: {
  id: string;
  legend: string;
  error: string | null;
  columns: string;
  options: { value: string; label: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <fieldset className="flex min-w-0 flex-col gap-2" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 text-sm leading-5 font-medium">{legend}</legend>
      <div className={cn("grid gap-2", columns)}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-2 py-2.5 text-center transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf",
              option.value === value ? "border-leaf bg-mint/50 text-ink" : "border-line bg-white text-ink hover:border-leaf hover:bg-milk",
              error && option.value !== value && "border-rose-deep/60",
            )}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </fieldset>
  );
}
