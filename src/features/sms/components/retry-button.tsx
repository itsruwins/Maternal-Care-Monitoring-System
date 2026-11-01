"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RetryIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { retrySms } from "../actions/retry";

// Retry on a failed text (admins): back in the queue at once, no confirm step.
export function RetryButton({ reminderId, motherName, className }: { reminderId: number; motherName: string; className?: string }) {
  const { t } = useDictionary();
  const l = t.sms.log;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const retry = () =>
    startTransition(async () => {
      const result = await retrySms(reminderId).catch(() => null);
      if (result?.ok) toast.success(l.retried);
      else if (result?.error === "too_late") toast.error(l.tooLate);
      else if (result?.error === "not_failed") toast.error(l.notFailed);
      else toast.error(t.sms.result.generic);
      router.refresh();
    });

  return (
    <Button
      type="button"
      size="sm"
      variant="soft"
      disabled={pending}
      aria-busy={pending}
      aria-label={format(l.retryFor, { name: motherName })}
      onClick={retry}
      className={className}
    >
      {pending ? <SpinnerIcon className="animate-spin" aria-hidden /> : <RetryIcon weight="bold" aria-hidden />}
      {l.retry}
    </Button>
  );
}
