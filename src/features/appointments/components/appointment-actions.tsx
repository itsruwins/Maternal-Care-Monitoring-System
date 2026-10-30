"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, CheckupIcon, DangerIcon, SpinnerIcon } from "@/components/icons";
import { SlotPicker } from "@/components/shared/slot-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import type { SlotError } from "@/lib/appointments/slots";
import type { AppointmentStatus } from "@/types/database";
import { cancelAppointment, confirmRequest, proposeNewTime } from "../actions/manage-appointments";
import type { SlotData } from "../types";

type Target = { id: number; status: AppointmentStatus; at: string; hasLogin: boolean };

// Confirm (requests only), Other time and Cancel for one open appointment.
export function AppointmentActions({
  appointment,
  slots,
  className,
  recordHref,
  datePassed = false,
}: {
  appointment: Target;
  slots: SlotData;
  className?: string;
  /** "Record visit" link (shown for today's confirmed appointments). */
  recordHref?: string;
  /** A request whose time has passed: no Confirm. */
  datePassed?: boolean;
}) {
  const { t } = useDictionary();
  const a = t.appointments;
  const router = useRouter();
  const [dialog, setDialog] = useState<"propose" | "cancel" | null>(null);
  const [confirming, startConfirm] = useTransition();
  if (!["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(appointment.status)) return null;

  const confirm = () =>
    startConfirm(async () => {
      const result = await confirmRequest(appointment.id);
      if (result.ok) toast.success(a.confirmed);
      else toast.error(t.appointmentErrors[result.error]);
      router.refresh();
    });

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {recordHref && (
        <Button asChild size="sm">
          <Link href={recordHref}>
            <CheckupIcon weight="bold" aria-hidden />
            {t.visits.record}
          </Link>
        </Button>
      )}
      {appointment.status === "REQUESTED" && !datePassed && (
        <Button type="button" size="sm" onClick={confirm} disabled={confirming} aria-busy={confirming}>
          {confirming ? <SpinnerIcon className="animate-spin" aria-hidden /> : <CheckIcon weight="bold" aria-hidden />}
          {a.confirm}
        </Button>
      )}
      <Button type="button" size="sm" variant="secondary" onClick={() => setDialog("propose")}>
        {a.otherTime}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setDialog("cancel")} className="text-rose-deep">
        {a.cancel}
      </Button>
      {dialog === "propose" && <ProposeDialog appointment={appointment} slots={slots} onClose={() => setDialog(null)} />}
      {dialog === "cancel" && <CancelDialog appointmentId={appointment.id} onClose={() => setDialog(null)} />}
    </div>
  );
}

function ProposeDialog({ appointment, slots, onClose }: { appointment: Target; slots: SlotData; onClose: () => void }) {
  const { t, locale } = useDictionary();
  const p = t.appointments.propose;
  const router = useRouter();
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<SlotError | "pick" | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!date || !time) {
      setError("pick");
      return;
    }
    startTransition(async () => {
      const result = await proposeNewTime(appointment.id, { date, time, remark });
      if (result.ok) {
        toast.success(result.status === "CONFIRMED" ? p.confirmedNoLogin : p.sent, { duration: 6000 });
        onClose();
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
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent closeLabel={t.common.close} className="sm:max-w-xl">
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{p.title}</DialogTitle>
          <DialogDescription>{appointment.hasLogin ? p.subtitle : t.appointments.noLogin}</DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8">
          <p className="tnum rounded-xl bg-milk px-4 py-3 text-[0.95rem]">{format(p.current, { when: formatSlot(appointment.at, locale) })}</p>
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
              setError(null);
            }}
            onTime={(slot) => {
              setTime(slot);
              setError(null);
            }}
            dayHeading={t.slotPicker.day}
            timeHeading={t.slotPicker.time}
            variant="plain"
            idPrefix={`propose-${appointment.id}`}
            today={slots.first}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor={`propose-remark-${appointment.id}`}>{p.remarkLabel}</Label>
            <Input
              id={`propose-remark-${appointment.id}`}
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              maxLength={300}
              aria-describedby={`propose-remark-hint-${appointment.id}`}
            />
            <p id={`propose-remark-hint-${appointment.id}`} className="text-sm text-ink-soft">
              {p.remarkHint}
            </p>
          </div>
          {error && <ErrorNote text={error === "pick" ? p.pick : t.appointmentErrors[error]} />}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending} className="w-full sm:w-auto">
              {t.appointments.cancelDialog.keep}
            </Button>
            <Button type="button" onClick={submit} disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
              {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
              {pending ? p.saving : appointment.hasLogin ? p.submit : p.submitNoLogin}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ appointmentId, onClose }: { appointmentId: number; onClose: () => void }) {
  const { t } = useDictionary();
  const c = t.appointments.cancelDialog;
  const router = useRouter();
  const [remark, setRemark] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = () =>
    startTransition(async () => {
      const result = await cancelAppointment(appointmentId, remark);
      if (result.ok) toast.success(c.done);
      else toast.error(t.appointmentErrors[result.error]);
      onClose();
      router.refresh();
    });

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.body}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 px-6 pt-4 sm:px-8">
          <Label htmlFor={`cancel-remark-${appointmentId}`}>{c.remarkLabel}</Label>
          <Input id={`cancel-remark-${appointmentId}`} value={remark} onChange={(event) => setRemark(event.target.value)} maxLength={300} />
        </div>
        <DialogFooter className="px-6 pt-5 sm:px-8 sm:pb-8">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            {c.keep}
          </Button>
          <Button type="button" variant="destructive" onClick={submit} disabled={pending} aria-busy={pending}>
            {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
            {c.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
      <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
      {text}
    </p>
  );
}
