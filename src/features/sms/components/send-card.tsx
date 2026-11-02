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

// Automatic sending: what the schedule does, the SMS phone and plan status,
// and Send now (the same run, right away). Results show as toasts.
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
      : // The date and time stay on one line.
        format(phoneOnline ? s.phoneOnline : s.phoneOffline, { time: formatSlot(phoneStatusAt, locale, "short").replace(/ /g, "\u00a0") });

  return (
    <section aria-labelledby="sms-send-title" className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-3">
          <IconCircle icon={SmsIcon} tone="mint" size="sm" />
          <div className="flex flex-col gap-1">
            <h2 id="sms-send-title" className="text-lg font-bold">{s.title}</h2>
            <p className="text-sm text-ink-soft">{s.intro}</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink-soft">
              <PhoneIcon aria-hidden className="size-5 shrink-0" />
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-full", phoneOnline === null ? "bg-sage" : phoneOnline ? "bg-leaf" : "bg-rose-deep")}
              />
              {phoneLine}
            </p>
          </div>
        </div>
        <Button type="button" disabled={running} aria-busy={running} onClick={runNow} className="w-full shrink-0 sm:w-auto">
          {running ? <SpinnerIcon className="animate-spin" aria-hidden /> : <SendIcon weight="bold" aria-hidden />}
          {running ? s.sending : s.now}
        </Button>
      </div>
      {limitReachedAt && (
        <p role="status" className="mt-4 flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3 text-sm leading-5 text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {format(s.limit, { date: formatSlotDate(limitReachedAt, locale, "short").replace(/ /g, "\u00a0") })}
        </p>
      )}
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
