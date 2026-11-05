"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LockIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import type { AccountStatus } from "@/types/database";
import { resetAccountPassword, setAccountStatus } from "../actions/manage-account";
import type { ActionResult } from "../types";

// The account's two admin actions, each behind a confirmation dialog: Reset
// password (in the header, an everyday fix) and Deactivate / Activate (in its
// own card at the bottom, away from the everyday actions).

/** Reset password: back to the username, changed at the next login. */
export function ResetPasswordAction({ userId, username }: { userId: string; username: string }) {
  const { t } = useDictionary();
  const d = t.accounts.detail;
  return (
    <ConfirmAction
      trigger={
        <>
          <LockIcon weight="bold" aria-hidden />
          {d.reset}
        </>
      }
      triggerVariant="outline"
      title={d.resetTitle}
      body={format(d.resetBody, { username })}
      confirm={d.reset}
      confirmVariant="default"
      action={() => resetAccountPassword(userId)}
      done={(result) => format(d.resetDone, { username: result.username ?? username })}
    />
  );
}

/** Deactivate (rose) while the account is on, Activate while it's off. */
export function AccessAction({ userId, status }: { userId: string; status: AccountStatus }) {
  const { t } = useDictionary();
  const d = t.accounts.detail;
  const deactivating = status === "ACTIVE";
  return (
    <ConfirmAction
      trigger={deactivating ? d.deactivate : d.activate}
      triggerVariant={deactivating ? "destructive" : "default"}
      title={deactivating ? d.deactivateTitle : d.activateTitle}
      body={deactivating ? d.deactivateBody : d.activateBody}
      confirm={deactivating ? d.deactivate : d.activate}
      confirmVariant={deactivating ? "destructive" : "default"}
      action={() => setAccountStatus(userId, deactivating ? "INACTIVE" : "ACTIVE")}
      done={() => d.statusDone}
    />
  );
}

type Variant = "default" | "outline" | "destructive";

function ConfirmAction({
  trigger,
  triggerVariant,
  title,
  body,
  confirm,
  confirmVariant,
  action,
  done,
}: {
  trigger: ReactNode;
  triggerVariant: Variant;
  title: string;
  body: string;
  confirm: string;
  confirmVariant: Variant;
  action: () => Promise<ActionResult>;
  done: (result: Extract<ActionResult, { ok: true }>) => string;
}) {
  const { t } = useDictionary();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [running, startRunning] = useTransition();

  const run = () =>
    startRunning(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(done(result), { duration: 8_000 });
        setOpen(false);
        router.refresh();
      } else {
        toast.error(t.accounts.errors[result.error]);
      }
    });

  return (
    <>
      <Button type="button" variant={triggerVariant} onClick={() => setOpen(true)} className="max-sm:w-full">
        {trigger}
      </Button>
      <Dialog open={open} onOpenChange={(next) => !next && !running && setOpen(false)}>
        <DialogContent closeLabel={t.common.close}>
          <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{body}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 pt-4 sm:px-8 sm:pb-8">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={running}>
              {t.accounts.create.cancel}
            </Button>
            <Button type="button" variant={confirmVariant} disabled={running} aria-busy={running} onClick={run}>
              {running && <SpinnerIcon className="animate-spin" aria-hidden />}
              {confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
