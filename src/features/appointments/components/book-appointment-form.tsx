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
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlotTime, type SlotError } from "@/lib/appointments/slots";
import { formatDate } from "@/lib/utils/pregnancy";
import { bookAppointment } from "../actions/manage-appointments";
import type { BookableMother, Service, SlotData } from "../types";

// Steps 2-4 of booking (the mother is chosen on the page): service, day,
// time, remarks. Starts CONFIRMED; the reminder is queued by the database.
export function BookAppointmentForm({
  mother,
  services,
  slots,
  initialServiceId = null,
  initialDate = null,
  doneHref,
  numbered = true,
}: {
  mother: BookableMother;
  services: Service[];
  slots: SlotData;
  /** Start with this service and day picked (e.g. the next checkup). */
  initialServiceId?: number | null;
  initialDate?: string | null;
  /** Where to go after booking (default: her record's Appointments tab). */
  doneHref?: string;
  /** "2. Service", "3. Day"...: off where the page has no "1. Mother" step. */
  numbered?: boolean;
}) {
  const { t, locale } = useDictionary();
  const b = t.appointments.bookPage;
  const heading = numbered
    ? { service: b.service, day: b.day, time: b.time }
    : { service: b.servicePlain, day: t.slotPicker.day, time: t.slotPicker.time };
  const router = useRouter();
  const [serviceId, setServiceId] = useState<number | null>(initialServiceId);
  const [date, setDate] = useState<string | null>(initialDate);
  const [time, setTime] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<SlotError | "required" | null>(null);
  const [pending, startTransition] = useTransition();
  const service = services.find((s) => s.id === serviceId) ?? null;
  // Picking a service (or "Change") swaps the section, so the focused button
  // disappears: move focus to the next step's heading instead.
  const focusAfter = useRef<string | null>(null);
  useEffect(() => {
    if (!focusAfter.current) return;
    document.getElementById(focusAfter.current)?.focus();
    focusAfter.current = null;
  }, [serviceId]);

  const submit = () => {
    if (!serviceId || !date || !time) {
      setError("required");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await bookAppointment({
        pregnancyId: mother.pregnancyId,
        serviceId,
        date,
        time,
        remark,
      });
      if (result.ok) {
        toast.success(
          format(b.done, {
            when: `${formatDate(date, locale)}, ${formatSlotTime(time, locale)}`,
          }),
          { duration: 6000 },
        );
        router.push(doneHref ?? `/staff/mothers/${mother.id}?tab=appointments`);
        router.refresh();
      } else {
        setError(result.error);
        if (result.error === "slot_taken") {
          setTime(null);
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {!service ? (
        <section
          aria-labelledby="book-service"
          className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 id="book-service" tabIndex={-1} className="mb-4 text-lg font-bold outline-none">
            {heading.service}
          </h2>
          <ServiceTiles
            services={services}
            onPick={(id) => {
              focusAfter.current = "book-day";
              setServiceId(id);
            }}
            label={heading.service}
            compact
          />
        </section>
      ) : (
        <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <ServiceArt icon={service.icon} size="sm" />
          <p className="min-w-0 flex-1 font-bold break-words">{service.name}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              focusAfter.current = "book-service";
              setServiceId(null);
              setDate(null);
              setTime(null);
            }}
          >
            <PencilIcon weight="bold" aria-hidden />
            {b.change}
          </Button>
        </section>
      )}

      {service && (
        <>
          <SlotPicker
            first={slots.first}
            last={slots.last}
            closedDays={slots.closedDays}
            taken={slots.taken}
            date={date}
            time={time}
            onDate={(day) => {
              setDate(day);
              setTime(null);
            }}
            onTime={setTime}
            dayHeading={heading.day}
            timeHeading={heading.time}
            idPrefix="book"
            today={slots.first}
          />

          <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <div className="flex flex-col gap-2">
              <Label htmlFor="book-remark">{b.remarkLabel}</Label>
              <Input
                id="book-remark"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                maxLength={300}
              />
            </div>
            {error && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep"
              >
                <DangerIcon
                  weight="fill"
                  aria-hidden
                  className="mt-px size-[1.125rem] shrink-0"
                />
                {error === "required" ? b.required : t.appointmentErrors[error]}
              </p>
            )}
            <div>
              <Button
                type="button"
                onClick={submit}
                disabled={pending}
                aria-busy={pending}
                className="w-full sm:w-auto"
              >
                {pending && (
                  <SpinnerIcon className="animate-spin" aria-hidden />
                )}
                {pending ? b.submitting : b.submit}
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
