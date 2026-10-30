"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppointmentIcon, CheckCircleIcon, PencilIcon, PlusIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconCircle } from "@/components/ui/icon-circle";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlot } from "@/lib/appointments/format";
import { deleteFollowUp } from "../actions/follow-ups";
import { rebookHref } from "../paths";
import type { FollowUpEntry, FollowUpItem } from "../types";
import { OutcomeChip, shortDay } from "./follow-up-bits";
import { FollowUpForm } from "./follow-up-form";

const HEADER = "px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16";

/** "Log follow-up": the form, then (if she was reached) the offer to rebook. */
export function LogFollowUpButton({ item, today, className }: { item: FollowUpItem; today: string; className?: string }) {
  const { t } = useDictionary();
  const f = t.followUps;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)} aria-label={format(f.logFor, { name: item.mother.name })} className={className}>
        <PlusIcon weight="bold" aria-hidden />
        {f.log}
      </Button>
      {open && <LogFollowUpDialog item={item} today={today} onClose={() => setOpen(false)} />}
    </>
  );
}

function LogFollowUpDialog({ item, today, onClose }: { item: FollowUpItem; today: string; onClose: () => void }) {
  const { t, locale } = useDictionary();
  const f = t.followUps;
  const router = useRouter();
  const [offer, setOffer] = useState(false);
  // The list refreshes when the dialog closes, so a filtered-out row doesn't
  // take the rebook offer away with it.
  const finish = () => {
    onClose();
    router.refresh();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && (offer ? finish() : onClose())}>
      <DialogContent closeLabel={t.common.close} className="sm:max-w-lg">
        {offer ? (
          <RebookOffer item={item} onSkip={finish} />
        ) : (
          <>
            <DialogHeader className={HEADER}>
              <DialogTitle>{f.form.newTitle}</DialogTitle>
              <DialogDescription>
                {format(f.form.about, { name: item.mother.name, service: item.service, when: formatSlot(item.missedAt, locale, "short") })}
              </DialogDescription>
            </DialogHeader>
            <FollowUpForm
              appointmentId={item.appointmentId}
              missedDate={item.missedDate}
              today={today}
              onSaved={({ reached, closing }) => {
                if (reached && !closing) {
                  setOffer(true);
                  return;
                }
                toast.success(f.form.saved);
                finish();
              }}
              onCancel={onClose}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** After a follow-up where she was reached: "Book a new appointment?" (inside the dialog). */
export function RebookOffer({ item, onSkip }: { item: FollowUpItem; onSkip: () => void }) {
  const { t } = useDictionary();
  const o = t.followUps.rebookOffer;
  return (
    <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center sm:px-8 sm:pb-8">
      <IconCircle icon={CheckCircleIcon} tone="mint" size="lg" />
      <DialogTitle className="mt-1">{o.title}</DialogTitle>
      <DialogDescription>{format(o.body, { name: item.mother.name })}</DialogDescription>
      <div className="mt-3 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <Button type="button" variant="ghost" onClick={onSkip} className="w-full sm:w-auto">
          {o.skip}
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href={rebookHref(item.appointmentId)} autoFocus>
            <AppointmentIcon weight="bold" aria-hidden />
            {o.book}
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** "See log": every follow-up for this missed visit, with Edit and (admins) Delete. */
export function FollowUpLogButton({ item, today, isAdmin }: { item: FollowUpItem; today: string; isAdmin: boolean }) {
  const { t } = useDictionary();
  const f = t.followUps;
  const [open, setOpen] = useState(false);
  if (item.entries.length === 0) return null;
  return (
    <>
      <Button type="button" variant="link" onClick={() => setOpen(true)} aria-label={format(f.seeLogFor, { name: item.mother.name })} className="h-11 self-start px-0 text-sm">
        {f.seeLog}
      </Button>
      {open && <FollowUpLogDialog item={item} today={today} isAdmin={isAdmin} onClose={() => setOpen(false)} />}
    </>
  );
}

function FollowUpLogDialog({ item, today, isAdmin, onClose }: { item: FollowUpItem; today: string; isAdmin: boolean; onClose: () => void }) {
  const { t, locale } = useDictionary();
  const f = t.followUps;
  const router = useRouter();
  const [editing, setEditing] = useState<FollowUpEntry | null>(null);
  const about = format(f.form.about, { name: item.mother.name, service: item.service, when: formatSlot(item.missedAt, locale, "short") });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={t.common.close} className="sm:max-w-lg">
        <DialogHeader className={HEADER}>
          <DialogTitle>{editing ? f.form.editTitle : f.logDialog.title}</DialogTitle>
          <DialogDescription>{about}</DialogDescription>
        </DialogHeader>
        {editing ? (
          <FollowUpForm
            appointmentId={item.appointmentId}
            missedDate={item.missedDate}
            today={today}
            entry={editing}
            onSaved={() => {
              toast.success(f.form.updated);
              setEditing(null);
              router.refresh();
            }}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div className="flex min-w-0 flex-col gap-5 px-6 pt-4 pb-6 sm:px-8 sm:pb-8">
            <ol className="flex flex-col divide-y divide-line">
              {item.entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} isAdmin={isAdmin} onEdit={() => setEditing(entry)} />
              ))}
            </ol>
            <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto sm:self-end">
              {f.logDialog.done}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EntryRow({ entry, isAdmin, onEdit }: { entry: FollowUpEntry; isAdmin: boolean; onEdit: () => void }) {
  const { t, locale } = useDictionary();
  const f = t.followUps;
  const l = f.logDialog;
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();
  const day = shortDay(entry.date, locale);

  const remove = () =>
    startDelete(async () => {
      const result = await deleteFollowUp(entry.id);
      if (result.ok) toast.success(l.deleted);
      else toast.error(t.followUpErrors[result.error ?? "generic"]);
      setConfirming(false);
      router.refresh();
    });

  return (
    <li className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className="tnum font-semibold">
          {day} · {f.methodsShort[entry.method]}
        </p>
        {entry.result && <OutcomeChip t={t} result={entry.result} />}
      </div>
      {entry.notes && <p className="text-[0.95rem] break-words whitespace-pre-line">{entry.notes}</p>}
      {entry.closeReason && (
        <p className="text-sm font-medium text-leaf">
          {f.endings.CLOSED}: {f.closeReasons[entry.closeReason]}
        </p>
      )}
      {entry.loggedBy && <p className="text-sm text-ink-soft">{format(l.loggedBy, { name: entry.loggedBy })}</p>}

      {confirming ? (
        <div role="alert" className="mt-1 flex flex-col gap-3 border-t border-dashed border-line pt-3">
          <p className="text-sm font-medium text-rose-deep">{l.deleteConfirm}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
              {l.deleteNo}
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={remove} disabled={deleting} aria-busy={deleting}>
              {deleting ? <SpinnerIcon className="animate-spin" aria-hidden /> : <TrashIcon weight="bold" aria-hidden />}
              {l.deleteYes}
            </Button>
          </div>
        </div>
      ) : entry.canEdit || isAdmin ? (
        <div className="mt-1 flex flex-wrap gap-2">
          {entry.canEdit && (
            <Button type="button" size="sm" variant="secondary" onClick={onEdit} aria-label={format(l.editEntry, { date: day })}>
              <PencilIcon weight="bold" aria-hidden />
              {l.edit}
            </Button>
          )}
          {isAdmin && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(true)} aria-label={format(l.deleteEntry, { date: day })} className="text-rose-deep">
              <TrashIcon weight="bold" aria-hidden />
              {l.delete}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-soft italic">{l.locked}</p>
      )}
    </li>
  );
}
