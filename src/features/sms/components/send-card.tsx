"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DangerIcon, PhoneIcon, SendIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-provider";
import { format } from "@/i18n/format";
import { formatSlotDate } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { sendNow } from "../actions/sending";
import type { RunSummary } from "../types";
import { phoneDot, phoneStatusText } from "./phone-status-line";

// Automatic sending, as one slim bar: the SMS phone's status (its dot leaf
// online, rose-deep offline, sage unknown) over a line on when texts go out,
// and Send now (the same run, right away; results show as toasts). When
// HTTPSMS's monthly limit was reached, a blush note under it.
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

  return (
    <section aria-labelledby="sms-send-title" className="rounded-2xl bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-mint text-leaf">
            <PhoneIcon aria-hidden className="size-5" />
            <span aria-hidden className={cn("absolute top-0.5 right-0.5 size-3 rounded-full ring-2 ring-white", phoneDot(phoneOnline))} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id="sms-send-title" className="sr-only">
              {s.title}
            </h2>
            <p className="font-semibold">{phoneStatusText(t, locale, phoneOnline, phoneStatusAt)}</p>
            <p className="text-sm text-ink-soft">{s.schedule}</p>
          </div>
        </div>
        <Button type="button" disabled={running} aria-busy={running} onClick={runNow} className="w-full shrink-0 sm:w-auto">
          {running ? <SpinnerIcon className="animate-spin" aria-hidden /> : <SendIcon weight="bold" aria-hidden />}
          {running ? s.sending : s.now}
        </Button>
      </div>
      {limitReachedAt && (
        <p role="status" className="flex items-start gap-2.5 border-t border-line bg-blush/60 px-5 py-3.5 text-sm leading-5 text-rose-deep sm:px-6">
          <DangerIcon weight="fill" aria-hidden className="mt-px size-[1.125rem] shrink-0" />
          {format(s.limit, { date: formatSlotDate(limitReachedAt, locale, "short").replace(/ /g, " ") })}
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
