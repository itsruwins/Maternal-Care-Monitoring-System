"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, SpinnerIcon } from "@/components/icons";
import { SlotPicker } from "@/components/shared/slot-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlotTime, type SlotError } from "@/lib/appointments/slots";
import { formatDate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { bookAppointment } from "../actions/manage-appointments";
import type { BookableMother, Service, SlotData } from "../types";

// Steps 2-4 of booking (the mother is chosen on the page): service, day,
// time, remarks. Starts CONFIRMED; the reminder is queued by the database.
export function BookAppointmentForm({ mother, services, slots }: { mother: BookableMother; services: Service[]; slots: SlotData }) {
  const { t, locale } = useDictionary();
  const b = t.appointments.bookPage;
  const router = useRouter();
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<SlotError | "required" | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!serviceId || !date || !time) {
      setError("required");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await bookAppointment({ pregnancyId: mother.pregnancyId, serviceId, date, time, remark });
      if (result.ok) {
        toast.success(format(b.done, { when: `${formatDate(date, locale)}, ${formatSlotTime(time, locale)}` }), { duration: 6000 });
        router.push(`/staff/mothers/${mother.id}?tab=appointments`);
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
      <fieldset className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <legend className="sr-only">{b.service}</legend>
        <p aria-hidden className="mb-4 text-lg font-bold">
          {b.service}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const checked = service.id === serviceId;
            return (
              <label
                key={service.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                  checked ? "border-leaf bg-mint/50" : "border-line hover:bg-milk",
                )}
              >
                <input type="radio" name="book-service" checked={checked} onChange={() => setServiceId(service.id)} className="size-5 shrink-0 accent-leaf" />
                <span className="font-semibold break-words">{service.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

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
        dayHeading={b.day}
        timeHeading={b.time}
        idPrefix="book"
      />

      <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <div className="flex flex-col gap-2">
          <Label htmlFor="book-remark">{b.remarkLabel}</Label>
          <Input id="book-remark" value={remark} onChange={(event) => setRemark(event.target.value)} maxLength={300} />
        </div>
        {error && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
            <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
            {error === "required" ? b.required : t.appointmentErrors[error]}
          </p>
        )}
        <div>
          <Button type="button" onClick={submit} disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
            {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
            {pending ? b.submitting : b.submit}
          </Button>
        </div>
      </section>
    </div>
  );
}
