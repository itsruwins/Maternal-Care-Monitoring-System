import { CallIcon, ClockIcon, HomeVisitIcon, SmsIcon, type Icon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatSlot, formatSlotDate } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import type { FollowUpMethod, FollowUpResult } from "@/types/database";
import type { FollowUpEntry, FollowUpItem } from "../types";

// Small pieces shared by the list, the cards and the dialogs (no hooks, so
// both server and client components can use them).

export const METHOD_ICONS: Record<FollowUpMethod, Icon> = { CALL: CallIcon, SMS: SmsIcon, HOME_VISIT: HomeVisitIcon };

/** "Thu, Oct 29" for a "YYYY-MM-DD" date. */
export function shortDay(date: string, locale: Locale): string {
  return formatSlotDate(`${date}T12:00:00+08:00`, locale, "short");
}

export function missedAgoText(t: Dictionary, daysAgo: number): string {
  const f = t.followUps;
  return daysAgo === 0 ? f.missedToday : daysAgo === 1 ? f.missedYesterday : format(f.missedDaysAgo, { days: daysAgo });
}

/** "Missed 5 days ago", the list's main clue (open items). */
export function MissedAgo({ t, daysAgo }: { t: Dictionary; daysAgo: number }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-deep">
      <ClockIcon weight="bold" aria-hidden className="size-4 shrink-0" />
      {missedAgoText(t, daysAgo)}
    </p>
  );
}

export function OutcomeChip({ t, result }: { t: Dictionary; result: FollowUpResult }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap",
        result === "REACHED" ? "bg-mint text-leaf" : "bg-cream text-ink-soft",
      )}
    >
      {t.followUps.outcomes[result]}
    </span>
  );
}

/** "Thu, Oct 29 · Call · Couldn't reach her". */
export function entrySummary(t: Dictionary, locale: Locale, entry: FollowUpEntry): string {
  const f = t.followUps;
  return [shortDay(entry.date, locale), f.methodsShort[entry.method], entry.result && f.outcomes[entry.result]].filter(Boolean).join(" · ");
}

/** "2 tries" + the last one, or "Not contacted yet". */
export function TriesSummary({ t, locale, entries }: { t: Dictionary; locale: Locale; entries: FollowUpEntry[] }) {
  const f = t.followUps;
  if (entries.length === 0) return <p className="text-sm text-ink-soft">{f.notContacted}</p>;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-semibold">{entries.length === 1 ? f.triesOne : format(f.tries, { count: entries.length })}</p>
      <p className="text-sm text-ink-soft">{format(f.lastTry, { details: entrySummary(t, locale, entries[0]) })}</p>
    </div>
  );
}

/** The date or slot never breaks across lines (The Unbroken Time Rule); the line may break before it. */
const unbroken = (text: string) => text.replace(/ /g, "\u00a0");

/** How a closed item ended: "Came in Thu, Nov 5", "Rebooked for …", etc. */
export function endingText(t: Dictionary, locale: Locale, ending: NonNullable<FollowUpItem["ending"]>): string {
  const f = t.followUps;
  switch (ending.how) {
    case "CAME_IN":
      return format(f.endings.CAME_IN, { date: ending.at ? unbroken(formatSlotDate(ending.at, locale, "short")) : "" });
    case "REBOOKED":
      return format(f.endings.REBOOKED, { when: ending.rebookedAt ? unbroken(formatSlot(ending.rebookedAt, locale, "short")) : "" });
    case "CLOSED":
      return ending.closeReason ? `${f.endings.CLOSED}: ${f.closeReasons[ending.closeReason]}` : f.endings.CLOSED;
    default:
      return f.endings.PREGNANCY_CLOSED;
  }
}

export function EndingChip({ t, locale, ending }: { t: Dictionary; locale: Locale; ending: NonNullable<FollowUpItem["ending"]> }) {
  const good = ending.how === "CAME_IN" || ending.how === "REBOOKED";
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-2xl px-2.5 py-1 text-caption leading-tight font-semibold",
        good ? "bg-mint text-leaf" : "bg-cream text-ink-soft",
      )}
    >
      {endingText(t, locale, ending)}
    </span>
  );
}
