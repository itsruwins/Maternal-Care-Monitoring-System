"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PhoneIcon, SendIcon, SmsIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlot, formatSlotDate } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { sendNow } from "../actions/sending";
import type { RunSummary } from "../types";

// Send now (the same run the schedule makes) and the SMS phone and plan
// status. Results show as toasts.
export function SendCard({
  phoneOnline,
  phoneStatusAt,
  limitReachedAt,
}: {
  phoneOnline: boolean | null;
  phoneStatusAt: string | null;
  limitReachedAt: string | null;
}) {
  const { t, locale } = useDictionary();
  const s = t.sms.send;
  const r = t.sms.result;
  const router = useRouter();
  const [running, startRun] = useTransition();

  const runNow = () =>
    startRun(async () => {
      const summary = await sendNow().catch(() => null);
      if (!summary || summary.stopped === "error") toast.error(r.generic);
      else if (summary.stopped && summary.stopped !== "limit") toast.error(r[summary.stopped]);
      else if (summary.stopped === "limit") toast.error(joinCounts(summary, r) ? `${r.limit} ${joinCounts(summary, r)}` : r.limit);
      else toast.success(joinCounts(summary, r) || r.nothing);
      router.refresh();
    });

  const phoneLine =
    phoneOnline === null || !phoneStatusAt
      ? s.phoneUnknown
      : format(phoneOnline ? s.phoneOnline : s.phoneOffline, { time: formatSlot(phoneStatusAt, locale, "short") });

  return (
    <section aria-labelledby="sms-send-title" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex items-center gap-3">
        <IconCircle icon={SmsIcon} tone="mint" size="sm" />
        <h2 id="sms-send-title" className="text-xl font-bold">{s.title}</h2>
      </div>
      <p className="mt-3 text-sm text-ink-soft">{s.intro}</p>

      <Button type="button" disabled={running} aria-busy={running} onClick={runNow} className="mt-5 w-full sm:w-auto">
        {running ? <SpinnerIcon className="animate-spin" aria-hidden /> : <SendIcon weight="bold" aria-hidden />}
        {running ? s.sending : s.now}
      </Button>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-soft">
          <PhoneIcon aria-hidden className="size-5 shrink-0" />
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-full", phoneOnline === null ? "bg-sage" : phoneOnline ? "bg-leaf" : "bg-rose-deep")}
          />
          {phoneLine}
        </p>
        {limitReachedAt && (
          <p role="status" className="flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
            <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
            {format(s.limit, { date: formatSlotDate(limitReachedAt, locale, "short") })}
          </p>
        )}
      </div>
    </section>
  );
}

// "2 sent · 1 failed · 3 checked", leaving out zeros ("" when all are zero).
function joinCounts(summary: RunSummary, r: { sent: string; retrying: string; failed: string; checked: string; delivered: string }) {
  return (["sent", "retrying", "failed", "checked", "delivered"] as const)
    .filter((key) => summary[key] > 0)
    .map((key) => format(r[key], { count: summary[key] }))
    .join(" · ");
}
