"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { cancelMyAppointment, respondToNewTime } from "../actions/my-appointments";
import type { ActionResult } from "../types";

function useRun() {
  const { t } = useDictionary();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<ActionResult>, success: string, after?: () => void) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        after?.();
        router.refresh();
      } else {
        toast.error(t.appointmentErrors[result.error]);
        after?.();
        router.refresh();
      }
    });
  return { pending, run };
}

/** "Cancel visit" / "Cancel request" behind a confirmation. */
export function CancelVisitButton({ appointmentId, isRequest }: { appointmentId: number; isRequest: boolean }) {
  const { t } = useDictionary();
  const a = t.myAppointments;
  const [open, setOpen] = useState(false);
  const { pending, run } = useRun();
  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-rose-deep">
        {isRequest ? a.cancelRequest : a.cancel}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => !pending && setOpen(next)}
        title={a.cancelTitle}
        body={a.cancelBody}
        keepLabel={a.keep}
        confirmLabel={isRequest ? a.cancelRequest : a.cancel}
        pending={pending}
        destructive
        onConfirm={() => run(() => cancelMyAppointment(appointmentId), a.cancelled, () => setOpen(false))}
      />
    </>
  );
}

/** Accept or decline a new time proposed by the health center. */
export function ProposalActions({ appointmentId }: { appointmentId: number }) {
  const { t } = useDictionary();
  const a = t.myAppointments;
  const [declining, setDeclining] = useState(false);
  const { pending, run } = useRun();
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button type="button" disabled={pending} aria-busy={pending} onClick={() => run(() => respondToNewTime(appointmentId, true), a.accepted)} className="w-full sm:w-auto">
        {pending && !declining ? <SpinnerIcon className="animate-spin" aria-hidden /> : <CheckIcon weight="bold" aria-hidden />}
        {a.accept}
      </Button>
      <Button type="button" variant="secondary" disabled={pending} onClick={() => setDeclining(true)} className="w-full sm:w-auto">
        {a.decline}
      </Button>
      <ConfirmDialog
        open={declining}
        onOpenChange={(next) => !pending && setDeclining(next)}
        title={a.declineTitle}
        body={a.declineBody}
        keepLabel={a.keep}
        confirmLabel={a.decline}
        pending={pending}
        destructive
        onConfirm={() => run(() => respondToNewTime(appointmentId, false), a.declined, () => setDeclining(false))}
      />
    </div>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  keepLabel,
  confirmLabel,
  pending,
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  keepLabel: string;
  confirmLabel: string;
  pending: boolean;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  const { t } = useDictionary();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-6 pt-4 sm:px-8 sm:pb-8">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            {keepLabel}
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} disabled={pending} aria-busy={pending} onClick={onConfirm}>
            {pending && <SpinnerIcon className="animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
