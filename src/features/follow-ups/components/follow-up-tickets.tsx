import Link from "next/link";
import { AppointmentIcon, CallIcon, LocationIcon } from "@/components/icons";
import { Pager } from "@/components/shared/pager";
import { Ticket, TicketPill } from "@/components/shared/ticket";
import { Button } from "@/components/ui/button";
import { CopyNumberButton } from "@/features/mothers/components/copy-number-button";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatMonthDay, formatSlot } from "@/lib/appointments/format";
import { cn } from "@/lib/utils/cn";
import { FOLLOW_UPS_PAGE_SIZE, OVER_A_WEEK_DAYS } from "../constants";
import { followUpsHref, rebookHref, recordFollowUpsHref } from "../paths";
import type { FollowUpFilters, FollowUpItem } from "../types";
import { entrySummary, TryTrail } from "./follow-up-bits";
import { FollowUpLogButton, LogFollowUpButton } from "./follow-up-dialogs";

type Shared = { t: Dictionary; locale: Locale; today: string; isAdmin: boolean };

// The Open tab: each missed visit as a booking ticket, under two headings,
// "Over a week ago" (rose) and "In the last 7 days", oldest first. Then which
// ones are shown and the pager.
export function FollowUpTickets({ items, total, filters, ...shared }: Shared & { items: FollowUpItem[]; total: number; filters: FollowUpFilters }) {
  const { t } = shared;
  const f = t.followUps;
  if (items.length === 0) {
    const hasFilters = Boolean(filters.q || filters.purok || filters.from || filters.to || filters.tried);
    return <p className="rounded-3xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{hasFilters ? f.empty : f.emptyOpen}</p>;
  }

  const groups = [
    { key: "overWeek", label: f.groups.overWeek, alert: true, items: items.filter((item) => item.daysAgo > OVER_A_WEEK_DAYS) },
    { key: "recent", label: f.groups.recent, alert: false, items: items.filter((item) => item.daysAgo <= OVER_A_WEEK_DAYS) },
  ].filter((group) => group.items.length > 0);
  const pages = Math.max(1, Math.ceil(total / FOLLOW_UPS_PAGE_SIZE));
  const first = (filters.page - 1) * FOLLOW_UPS_PAGE_SIZE + 1;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`follow-ups-${group.key}`} className="flex flex-col gap-3">
          <h2 id={`follow-ups-${group.key}`} className={cn("flex items-center gap-2 text-sm font-bold", group.alert ? "text-rose-deep" : "text-ink")}>
            {group.label}
            <span className={cn("tnum grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-caption", group.alert ? "bg-blush" : "bg-white shadow-[var(--shadow-soft)]")}>
              {group.items.length}
            </span>
          </h2>
          <ul className="grid gap-4 xl:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.appointmentId} className="min-w-0">
                <FollowUpTicket {...shared} item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="tnum text-sm text-ink-soft">{format(f.list.showing, { from: first, to: first + items.length - 1, total })}</p>
        <Pager page={filters.page} pages={pages} hrefFor={(page) => followUpsHref(filters, { page })} labels={{ prev: f.prev, next: f.next, page: f.page }} />
      </div>
    </div>
  );
}

// The stub says how long ago she missed it, large, over the day it was
// (blush; filled rose-deep once it's over a week). The body: her initials,
// name, number (tap to call, or copy) and purok; the service and its slot;
// the tries so far as a trail of dots, the last one, and See log. The milk
// band: Log follow-up, Call and Rebook.
function FollowUpTicket({ t, locale, today, isAdmin, item }: Shared & { item: FollowUpItem }) {
  const f = t.followUps;
  const s = f.stub;
  const copy = t.mothers.record.actions;
  const last = item.entries[0];
  const tel = `tel:${item.mother.contactNumber.replace(/[^\d+]/g, "")}`;

  return (
    <Ticket
      tone={item.daysAgo > OVER_A_WEEK_DAYS ? "rose" : "blush"}
      stub={
        <>
          {item.daysAgo === 0 ? (
            <span className="text-2xl leading-none font-extrabold">{s.today}</span>
          ) : (
            <>
              <span className="tnum text-[2.5rem] leading-none font-extrabold tracking-[-0.03em] sm:text-5xl">{item.daysAgo}</span>
              <span className="mt-1 text-sm font-semibold">{item.daysAgo === 1 ? s.dayAgo : s.daysAgo}</span>
            </>
          )}
          <TicketPill>{formatMonthDay(item.missedAt, locale)}</TicketPill>
        </>
      }
      footer={
        <div className="flex flex-wrap gap-2 max-sm:grid max-sm:grid-cols-2">
          <LogFollowUpButton item={item} today={today} className="max-sm:col-span-2 max-sm:h-11" />
          <Button asChild size="sm" variant="soft" className="max-sm:h-11">
            <a href={tel} aria-label={format(f.call, { name: item.mother.name })} className="no-underline">
              <CallIcon weight="bold" aria-hidden />
              {f.callButton}
            </a>
          </Button>
          <Button asChild size="sm" variant="soft" className="max-sm:h-11">
            <Link href={rebookHref(item.appointmentId)} aria-label={format(f.rebookFor, { name: item.mother.name })} className="no-underline">
              <AppointmentIcon weight="bold" aria-hidden />
              {f.rebook}
            </Link>
          </Button>
        </div>
      }
    >
      <span className="flex min-w-0 items-start gap-3">
        <MotherInitials name={item.mother.name} />
        <span className="flex min-w-0 flex-col">
          <Link href={recordFollowUpsHref(item.mother.id)} className="self-start font-bold break-words text-ink no-underline hover:text-leaf hover:underline">
            {item.mother.name}
          </Link>
          <span className="flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
            <span className="inline-flex items-center">
              <a href={tel} className="tnum text-ink-soft no-underline hover:text-leaf hover:underline">
                {item.mother.contactNumber}
              </a>
              <CopyNumberButton number={item.mother.contactNumber} labels={{ copy: copy.copy, copied: copy.copied, failed: copy.copyFailed }} />
            </span>
            <span className="inline-flex items-center gap-1">
              <LocationIcon aria-hidden className="size-4" />
              {item.mother.purok ?? f.noPurokYet}
            </span>
          </span>
        </span>
      </span>

      <div className="flex flex-col gap-0.5">
        <p className="font-semibold break-words text-ink">{item.service}</p>
        <p className="tnum text-sm text-ink-soft">{formatSlot(item.missedAt, locale, "short")}</p>
      </div>

      <div className="flex flex-col gap-0.5 border-t border-line pt-3">
        {last ? (
          <>
            <div className="flex min-h-11 flex-wrap items-center gap-x-2.5">
              <TryTrail entries={item.entries} />
              <span className="font-semibold text-ink">{item.entries.length === 1 ? f.triesOne : format(f.tries, { count: item.entries.length })}</span>
              <span aria-hidden className="text-line">
                |
              </span>
              <FollowUpLogButton item={item} today={today} isAdmin={isAdmin} />
            </div>
            <p className="text-sm text-ink-soft">{format(f.lastTry, { details: entrySummary(t, locale, last) })}</p>
          </>
        ) : (
          <p className="flex min-h-11 items-center text-sm font-semibold text-ink-soft">{f.notContacted}</p>
        )}
      </div>
    </Ticket>
  );
}
