import Link from "next/link";
import { CheckCircleIcon, CheckupIcon } from "@/components/icons";
import { Ticket, type TicketTone } from "@/components/shared/ticket";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/features/appointments/components/appointment-bits";
import { MotherInitials } from "@/features/mothers/components/mother-initials";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { slotClockParts } from "@/lib/appointments/format";
import { motherVisitsHref, recordVisitHref, visitHref } from "../paths";
import type { TodayAppointment } from "../types";

// Today's appointments on the Visits page as booking tickets (the same ticket
// as a waiting request): the stub holds the time, large, over AM/PM; mint
// while it waits, leaf with a check once her visit is recorded, blush with
// rose-deep if she missed it. The body: her initials, name and number, the
// service (with the Missed or Moved chip) and how far along she is. The milk
// band holds Record visit, or "Visit recorded" with View. Two per row from
// 1280px. The staff dashboard shows the same day as a table.
export function TodayTickets({ t, locale, items }: { t: Dictionary; locale: Locale; items: TodayAppointment[] }) {
  const v = t.visits;
  if (items.length === 0) {
    return <p className="rounded-3xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{v.todayEmpty}</p>;
  }
  return (
    <ul className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <TodayTicket t={t} locale={locale} item={item} />
        </li>
      ))}
    </ul>
  );
}

function TodayTicket({ t, locale, item }: { t: Dictionary; locale: Locale; item: TodayAppointment }) {
  const v = t.visits;
  const visitId = item.visitId ?? item.dayVisitId;
  const done = visitId !== null || item.status === "COMPLETED";
  const tone: TicketTone = done ? "leaf" : item.status === "MISSED" ? "blush" : "mint";
  const { clock, period } = slotClockParts(item.at, locale);

  return (
    <Ticket
      tone={tone}
      stub={
        <>
          {done && <CheckCircleIcon weight="fill" aria-hidden className="mb-2 size-6 motion-safe:animate-pop" />}
          <span className="tnum text-[2rem] leading-none font-extrabold tracking-[-0.03em] sm:text-[2.5rem]">{clock}</span>
          {period && <span className="mt-1.5 text-sm font-semibold">{period}</span>}
        </>
      }
      footer={
        visitId !== null ? (
          <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
              <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
              {item.visitId ? v.recorded : v.completedAtVisit}
            </span>
            <Button asChild variant="soft" size="sm">
              <Link href={visitHref(visitId)} aria-label={format(v.ticket.viewLabel, { name: item.mother.name })} className="no-underline">
                {v.ticket.view}
              </Link>
            </Button>
          </div>
        ) : item.status === "COMPLETED" ? (
          <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-leaf">
            <CheckCircleIcon weight="fill" aria-hidden className="size-5" />
            {t.appointments.statuses.COMPLETED}
          </span>
        ) : (
          <Button asChild className="max-sm:w-full">
            <Link href={recordVisitHref(item.id)} className="no-underline">
              <CheckupIcon weight="bold" aria-hidden />
              {v.record}
            </Link>
          </Button>
        )
      }
    >
      <span className="flex min-w-0 items-center gap-3">
        <MotherInitials name={item.mother.name} />
        <span className="flex min-w-0 flex-col">
          <Link
            href={motherVisitsHref(item.mother.id)}
            className="self-start font-bold break-words text-ink no-underline hover:text-leaf hover:underline"
          >
            {item.mother.name}
          </Link>
          <span className="tnum text-sm text-ink-soft">{item.mother.contactNumber}</span>
        </span>
      </span>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <p className="min-w-0 font-semibold break-words text-ink">{item.service}</p>
          {(item.status === "MISSED" || item.status === "RESCHEDULED") && <StatusChip t={t} status={item.status} />}
        </div>
        {item.weeks !== null && <p className="text-sm text-ink-soft">{format(v.ticket.weeks, { weeks: item.weeks })}</p>}
      </div>
    </Ticket>
  );
}
