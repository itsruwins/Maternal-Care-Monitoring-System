"use client";

import { useState, useTransition } from "react";
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

type Pending = "reset" | "status" | null;

// Reset password + activate/deactivate, each behind a confirmation dialog.
export function AccountSecurity({
  userId,
  username,
  status,
  isSelf,
}: {
  userId: string;
  username: string;
  status: AccountStatus;
  isSelf: boolean;
}) {
  const { t } = useDictionary();
  const d = t.accounts.detail;
  const router = useRouter();
  const [confirm, setConfirm] = useState<Pending>(null);
  const [running, startRunning] = useTransition();
  const deactivating = status === "ACTIVE";

  const run = (action: () => Promise<ActionResult>, success: (result: Extract<ActionResult, { ok: true }>) => string) => {
    startRunning(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success(result), { duration: 8_000 });
        setConfirm(null);
        router.refresh();
      } else {
        toast.error(t.accounts.errors[result.error]);
      }
    });
  };

  if (isSelf) return <p className="text-sm text-ink-soft">{d.self}</p>;

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => setConfirm("reset")}>
          <LockIcon weight="bold" aria-hidden />
          {d.reset}
        </Button>
        <Button type="button" variant={deactivating ? "destructive" : "soft"} onClick={() => setConfirm("status")}>
          {deactivating ? d.deactivate : d.activate}
        </Button>
      </div>

      <Dialog open={confirm !== null} onOpenChange={(open) => !open && !running && setConfirm(null)}>
        <DialogContent closeLabel={t.common.close}>
          <DialogHeader className="px-6 pt-5 pr-16 sm:px-8 sm:pt-8 sm:pr-16">
            <DialogTitle>
              {confirm === "reset" ? d.resetTitle : deactivating ? d.deactivateTitle : d.activateTitle}
            </DialogTitle>
            <DialogDescription>
              {confirm === "reset"
                ? format(d.resetBody, { username })
                : deactivating
                  ? d.deactivateBody
                  : d.activateBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 pt-4 sm:px-8 sm:pb-8">
            <Button type="button" variant="ghost" onClick={() => setConfirm(null)} disabled={running}>
              {t.accounts.create.cancel}
            </Button>
            <Button
              type="button"
              variant={confirm === "status" && deactivating ? "destructive" : "default"}
              disabled={running}
              aria-busy={running}
              onClick={() =>
                confirm === "reset"
                  ? run(
                      () => resetAccountPassword(userId),
                      (result) => format(d.resetDone, { username: result.username ?? username }),
                    )
                  : run(
                      () => setAccountStatus(userId, deactivating ? "INACTIVE" : "ACTIVE"),
                      () => d.statusDone,
                    )
              }
            >
              {running && <SpinnerIcon className="animate-spin" aria-hidden />}
              {confirm === "reset" ? d.reset : deactivating ? d.deactivate : d.activate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
