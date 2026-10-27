"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SpinnerIcon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatDate } from "@/lib/utils/pregnancy";
import { removeClosedDay } from "../actions/closed-day";

// Opens a future closed day again (easy to redo, so no confirmation).
export function RemoveClosedDayButton({ date }: { date: string }) {
  const { t, locale } = useDictionary();
  const c = t.closedDays;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const label = formatDate(date, locale);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-busy={pending}
      aria-label={format(c.removeName, { date: label })}
      onClick={() =>
        startTransition(async () => {
          const result = await removeClosedDay(date);
          if (!result.ok) {
            toast.error(c.errors.generic);
            return;
          }
          toast.success(format(c.removed, { date: label }));
          router.refresh();
        })
      }
    >
      {pending ? <SpinnerIcon className="animate-spin" aria-hidden /> : <TrashIcon weight="bold" aria-hidden />}
      {c.remove}
    </Button>
  );
}
