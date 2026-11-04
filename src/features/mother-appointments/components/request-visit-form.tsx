"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PencilIcon, SpinnerIcon } from "@/components/icons";
import { ServiceArt } from "@/components/shared/service-art";
import { ServiceTiles } from "@/components/shared/service-tiles";
import { SlotPicker } from "@/components/shared/slot-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/i18n/dictionary-provider";
import { formatSlotTime, type SlotError } from "@/lib/appointments/slots";
import { parseISODate } from "@/lib/utils/pregnancy";
import { requestVisit } from "../actions/my-appointments";
import type { BookingData } from "../types";

// Request a visit. First the service tiles; once she picks one it folds into a
// chip (with Change) and the day strip and times appear. When a day and time
// are picked, a summary bar with "Send request" rises above the bottom
// navigation. The database checks every rule again when she sends it.
export function RequestVisitForm({ data }: { data: BookingData }) {
  const { t, locale } = useDictionary();
  const n = t.myAppointments.new;
  const router = useRouter();
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [error, setError] = useState<SlotError | null>(null);
  const [pending, startTransition] = useTransition();
  const service = data.services.find((s) => s.id === serviceId) ?? null;
  const ready = Boolean(service && date && time);
  // Picking a service (or "Change") swaps the section, so the focused button
  // disappears: move focus to the next step's heading instead.
  const focusAfter = useRef<string | null>(null);
  useEffect(() => {
    if (!focusAfter.current) return;
    document.getElementById(focusAfter.current)?.focus();
    focusAfter.current = null;
  }, [serviceId]);

  const send = () => {
    if (!serviceId || !date || !time) return;
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

  if (!service) {
    return (
      <section aria-labelledby="choose-service" className="flex flex-col gap-4">
        <h2 id="choose-service" tabIndex={-1} className="text-xl font-bold outline-none">
          {n.chooseService}
        </h2>
        <ServiceTiles
          services={data.services}
          onPick={(id) => {
            focusAfter.current = "request-day";
            setServiceId(id);
          }}
          label={n.chooseService}
        />
      </section>
    );
  }

  const when = date && time
    ? `${new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(parseISODate(date)!)} · ${formatSlotTime(time, locale)}`
    : null;

  return (
    <div className={ready ? "pb-44" : undefined}>
      <div className="flex flex-col gap-6">
        {/* The chosen service, folded */}
        <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <ServiceArt icon={service.icon} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-bold break-words">{service.name}</p>
            {service.description && <p className="text-sm text-ink-soft">{service.description}</p>}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              focusAfter.current = "choose-service";
              setServiceId(null);
              setDate(null);
              setTime(null);
              setError(null);
            }}
          >
            <PencilIcon weight="bold" aria-hidden />
            {n.change}
          </Button>
        </section>

        <SlotPicker
          first={data.first}
          last={data.last}
          today={data.today}
          closedDays={data.closedDays}
          taken={data.taken}
          date={date}
          time={time}
          onDate={(day) => {
            setDate(day);
            setTime(null);
            setError(null);
          }}
          onTime={(slot) => {
            setTime(slot);
            setError(null);
          }}
          dayHeading={n.chooseDay}
          timeHeading={n.chooseTime}
          idPrefix="request"
        />
      </div>

      {/* Summary bar above the bottom navigation (right-scroll-bar-position:
          it stays put when a dialog or menu hides the page scrollbar) */}
      {ready && (
        <div className="right-scroll-bar-position fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 px-4">
          <div className="mx-auto flex max-w-xl flex-col gap-3 rounded-3xl border border-line bg-white p-4 shadow-[var(--shadow-float)]">
            <div className="flex items-center gap-3">
              <ServiceArt icon={service.icon} size="sm" className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="tnum text-[1.05rem] font-bold">{when}</p>
                <p className="text-sm break-words text-ink-soft">{service.name}</p>
              </div>
            </div>
            {noteOpen && (
              <div className="flex flex-col gap-1.5">
                <Input
                  aria-label={n.noteLabel}
                  placeholder={n.noteHint}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={300}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setNote("");
                    setNoteOpen(false);
                  }}
                  className="self-start text-sm font-medium text-ink-soft underline decoration-1 underline-offset-4"
                >
                  {n.hideNote}
                </button>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              {noteOpen ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="text-sm font-semibold text-leaf underline decoration-1 underline-offset-4"
                >
                  {n.addNote}
                </button>
              )}
              <Button type="button" onClick={send} disabled={pending} aria-busy={pending}>
                {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
                {pending ? n.submitting : n.submit}
              </Button>
            </div>
            {error && (
              <p role="alert" className="flex items-start gap-2 text-sm text-rose-deep">
                <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0" />
                {t.appointmentErrors[error]}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
