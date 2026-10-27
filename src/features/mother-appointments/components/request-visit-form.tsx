"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlotTime, isWeekday, SLOT_TIMES, slotKey, type SlotError } from "@/lib/appointments/slots";
import { formatDate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { requestVisit } from "../actions/my-appointments";
import type { BookingData } from "../types";
import { MonthCalendar, type DayState } from "./month-calendar";

// Request a visit: service → day → open time → optional note. Days and times
// that are taken, closed or out of range can't be picked; the database checks
// again when she sends it.
export function RequestVisitForm({ data }: { data: BookingData }) {
  const { t, locale } = useDictionary();
  const n = t.myAppointments.new;
  const router = useRouter();
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<SlotError | "required" | null>(null);
  const [pending, startTransition] = useTransition();

  const taken = useMemo(() => new Set(data.taken), [data.taken]);
  const closed = useMemo(() => new Set(data.closedDays), [data.closedDays]);
  const stateOf = (day: string): DayState => {
    if (day < data.first || day > data.last || !isWeekday(day)) return "out";
    if (closed.has(day)) return "closed";
    return SLOT_TIMES.every((slot) => taken.has(slotKey(day, slot))) ? "full" : "open";
  };
  const service = data.services.find((s) => s.id === serviceId);
  const openTimes = date ? SLOT_TIMES.filter((slot) => !taken.has(slotKey(date, slot))) : [];

  const submit = () => {
    if (!serviceId || !date || !time) {
      setError("required");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await requestVisit({ serviceId, date, time, note });
      if (result.ok) {
        toast.success(n.sent, { duration: 6000 });
        router.push("/mother/appointments");
        router.refresh();
      } else {
        setError(result.error);
        // Someone may have just taken it: refresh the open times.
        if (result.error === "slot_taken") {
          setTime(null);
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Service */}
      <fieldset className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <legend className="sr-only">{n.service}</legend>
        <p aria-hidden className="mb-4 text-lg font-bold">
          {n.service}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.services.map((option) => {
            const checked = option.id === serviceId;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                  checked ? "border-leaf bg-mint/50" : "border-line hover:bg-milk",
                )}
              >
                <input
                  type="radio"
                  name="service"
                  value={option.id}
                  checked={checked}
                  onChange={() => setServiceId(option.id)}
                  className="mt-0.5 size-5 shrink-0 accent-leaf"
                />
                <span className="min-w-0">
                  <span className="block font-semibold break-words">{option.name}</span>
                  {option.description && <span className="mt-0.5 block text-sm text-ink-soft">{option.description}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* 2. Day */}
        <section aria-labelledby="pick-day" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="pick-day" className="mb-4 text-lg font-bold">
            {n.date}
          </h2>
          <MonthCalendar
            first={data.first}
            last={data.last}
            stateOf={stateOf}
            selected={date}
            onSelect={(day) => {
              setDate(day);
              setTime(null);
            }}
            locale={locale}
            labels={{ prev: n.prevMonth, next: n.nextMonth, closed: n.closedDay }}
          />
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-full bg-ink" />
              {n.legendOpen}
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-full bg-ink-soft/30" />
              {n.legendFull}
            </span>
          </p>
        </section>

        {/* 3. Time */}
        <fieldset className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <legend className="sr-only">{n.time}</legend>
          <p aria-hidden className="mb-4 text-lg font-bold">
            {n.time}
          </p>
          {!date ? (
            <p className="text-ink-soft">{n.pickDateFirst}</p>
          ) : openTimes.length === 0 ? (
            <p className="text-ink-soft">{n.noTimes}</p>
          ) : (
            <>
              <p className="mb-3 font-medium">{formatDate(date, locale)}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {SLOT_TIMES.map((slot) => {
                  const isTaken = taken.has(slotKey(date, slot));
                  const checked = slot === time;
                  return (
                    <label
                      key={slot}
                      className={cn(
                        "tnum relative flex h-12 items-center justify-center rounded-full border text-[0.95rem] font-semibold transition-colors",
                        isTaken && "cursor-not-allowed border-transparent bg-cream text-ink-soft/50 line-through",
                        !isTaken && !checked && "cursor-pointer border-field text-ink hover:border-leaf hover:bg-mint/40",
                        checked && "border-leaf bg-leaf text-white",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf",
                      )}
                    >
                      <input
                        type="radio"
                        name="time"
                        value={slot}
                        checked={checked}
                        disabled={isTaken}
                        onChange={() => setTime(slot)}
                        className="sr-only"
                      />
                      {formatSlotTime(slot, locale)}
                      {isTaken && <span className="sr-only"> ({n.taken})</span>}
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </fieldset>
      </div>

      {/* Note + send */}
      <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <div className="flex flex-col gap-2">
          <Label htmlFor="visit-note">{n.noteLabel}</Label>
          <Input id="visit-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} aria-describedby="visit-note-hint" />
          <p id="visit-note-hint" className="text-sm text-ink-soft">
            {n.noteHint}
          </p>
        </div>
        {service && date && time && (
          <p className="rounded-xl bg-milk px-4 py-3 font-medium">
            {format(n.summary, { service: service.name, date: formatDate(date, locale), time: formatSlotTime(time, locale) })}
          </p>
        )}
        {error && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
            <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
            {error === "required" ? n.required : t.appointmentErrors[error]}
          </p>
        )}
        <div>
          <Button type="button" onClick={submit} disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
            {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
            {pending ? n.submitting : n.submit}
          </Button>
        </div>
      </section>
    </div>
  );
}
