import Link from "next/link";
import {
  AppointmentIcon,
  CalendarPlusIcon,
  CallIcon,
  CheckupIcon,
  ClockIcon,
  CloseIcon,
  HomeVisitIcon,
  SmsIcon,
  type Icon,
} from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/date-time";
import type { RecordTab } from "./mother-record-screen";
import type { MotherEvent } from "../types";

type Tone = "mint" | "blush" | "cream";
type Shown = { icon: Icon; tone: Tone; title: string; line: string | null; tab: RecordTab };

// Her latest events, newest first, as a short timeline: a small icon circle on
// a hairline rail, what happened, a detail line (the service, or the visit
// time for an appointment) and when it happened. Each row opens the tab it came from. Missed visits and failed
// texts take the blush tint (they need someone); a cancelled visit is cream;
// the rest mint.
export function RecentActivity({ t, locale, events }: { t: Dictionary; locale: Locale; events: MotherEvent[] }) {
  const a = t.mothers.record.activity;
  return (
    <section aria-labelledby="her-activity" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <IconCircle icon={ClockIcon} tone="mint" size="sm" />
        <h2 id="her-activity" className="text-xl font-bold">
          {a.title}
        </h2>
      </div>
      {events.length === 0 ? (
        <p className="rounded-2xl bg-milk px-5 py-6 text-center text-[0.95rem] text-ink-soft">{a.empty}</p>
      ) : (
        <ol className="-mx-3 flex flex-col">
          {events.map((event) => {
            const shown = describe(t, locale, event);
            return (
              <li key={event.id} className="group/item relative">
                {/* The rail between this circle and the next one. */}
                <span aria-hidden className="absolute top-12 bottom-0 left-[1.875rem] w-px bg-line group-last/item:hidden" />
                <Link
                  href={`?tab=${shown.tab}`}
                  scroll={false}
                  className="relative flex items-start gap-3 rounded-xl px-3 py-2.5 no-underline transition-colors hover:bg-milk focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid"
                >
                  <IconCircle icon={shown.icon} tone={shown.tone} size="sm" weight="bold" />
                  <span className="flex min-w-0 flex-col pt-1.5">
                    <span className={cn("text-[0.95rem] leading-snug font-semibold break-words", shown.tone === "blush" ? "text-rose-deep" : "text-ink")}>
                      {shown.title}
                    </span>
                    {shown.line && <span className="mt-0.5 text-sm text-ink">{shown.line}</span>}
                    <span className="mt-0.5 text-sm text-ink-soft">{formatDateTime(event.at, locale)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function describe(t: Dictionary, locale: Locale, event: MotherEvent): Shown {
  const a = t.mothers.record.activity;
  switch (event.kind) {
    case "visit":
      return { icon: CheckupIcon, tone: "mint", title: format(a.visit, { weeks: event.weeks }), line: event.services[0] ?? null, tab: "visits" };
    case "appointment": {
      const service = event.service;
      const when = format(a.forVisit, { when: formatSlot(event.visitAt, locale, "short") });
      switch (event.status) {
        case "MISSED":
          return { icon: ClockIcon, tone: "blush", title: format(a.missed, { service }), line: null, tab: "followUps" };
        case "CANCELLED":
          return { icon: CloseIcon, tone: "cream", title: format(a.cancelled, { service }), line: when, tab: "appointments" };
        case "REQUESTED":
          return { icon: AppointmentIcon, tone: "mint", title: format(a.requested, { service }), line: when, tab: "appointments" };
        case "RESCHEDULED":
          return { icon: AppointmentIcon, tone: "mint", title: format(a.newTime, { service }), line: when, tab: "appointments" };
        default:
          return { icon: CalendarPlusIcon, tone: "mint", title: format(a.booked, { service }), line: when, tab: "appointments" };
      }
    }
    case "text": {
      const type = t.sms.log.types[event.type];
      const failed = event.status === "FAILED";
      return { icon: SmsIcon, tone: failed ? "blush" : "mint", title: format(failed ? a.textFailed : a.text, { type }), line: null, tab: "sms" };
    }
    case "followUp": {
      const method = t.followUps.methods[event.method];
      return {
        icon: event.method === "CALL" ? CallIcon : event.method === "HOME_VISIT" ? HomeVisitIcon : SmsIcon,
        tone: "mint",
        title: event.result ? format(a.followUp, { method, result: t.followUps.outcomes[event.result] }) : format(a.followUpPlain, { method }),
        line: null,
        tab: "followUps",
      };
    }
  }
}
