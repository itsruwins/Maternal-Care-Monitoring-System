import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarPlusIcon, ClockIcon, InfoIcon, LocationIcon, NoteIcon, PhoneIcon, PlusIcon, ReminderIcon, type Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { isPlaceholder, SITE } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { calendarHref, directionsHref, visitCalendarFile } from "@/lib/appointments/calendar";
import { formatSlot, formatSlotClock } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { cn } from "@/lib/utils/cn";
import { getMyAppointments } from "../queries/get-my-appointments";
import { getMyMissedVisits } from "../queries/get-my-missed-visits";
import type { MissedVisit, MyAppointment, MyAppointments, MyReminder } from "../types";
import { ProposalActions, VisitMenu } from "./appointment-actions";
import { ServiceIllustration } from "@/components/shared/service-illustration";
import { ClinicInfo } from "./clinic-info";
import { MissedVisitNotice } from "./missed-visit-notice";
import { VisitDateTile, VisitStatusTag } from "./visit-status";
import { VisitTabs } from "./visit-tabs";

// /mother/appointments: a new time to answer first, then her next visit in a
// big card, the rest of her visits under Upcoming / Past tabs (and the
// missed-visit notice), beside the clinic info. Reads the session: render
// inside <Suspense>.
export async function MyAppointmentsScreen() {
  const user = await requireRole(AREA_ROLES.mother);
  const [{ t, locale }, data, missed] = await Promise.all([getServerI18n(), getMyAppointments(user), getMyMissedVisits()]);
  return <MyAppointmentsView t={t} locale={locale} data={data} missed={missed} today={manilaTodayISO()} now={new Date().toISOString()} />;
}

/** "Wednesday, November 4 · 1:30 PM" that can only break after the weekday's comma. */
const unbroken = (slot: string) => slot.replace(/(?<!,) /g, " ");

const intlTag = (locale: Locale) => (locale === "fil" ? "fil-PH" : "en-PH");

/** Parts of a visit's date in Manila time, e.g. { weekday: "long" } → "Thursday". */
function manilaDate(iso: string, locale: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlTag(locale), {
    timeZone: "Asia/Manila",
    ...options,
  }).format(new Date(iso));
}

/** The visit's time: the confirmed or proposed one, else the one she asked for. */
const visitAt = (item: MyAppointment) => item.scheduledAt ?? item.requestedAt;

/** "Today, 8:30 AM" or "Thursday, 9:00 AM". */
function dayAndTime(t: Dictionary, locale: Locale, at: string, today: string) {
  const day = manilaSlot(at).date === today ? t.today.todayShort : manilaDate(at, locale, { weekday: "long" });
  return `${day}, ${formatSlotClock(at, locale)}`;
}

/** What a visit can do now: cancel online (until the day before), or not; a request whose time passed. */
function visitState(item: MyAppointment, today: string, now: string) {
  const at = visitAt(item);
  const isRequest = item.status === "REQUESTED";
  return {
    at,
    isRequest,
    canCancel: isRequest || manilaSlot(at).date > today,
    // Not answered before its time: staff will offer another time (or cancel it).
    datePassed: isRequest && Date.parse(at) <= Date.parse(now),
    reminder: item.reminder && item.reminder.status !== "SKIPPED" ? item.reminder : null,
  };
}

// The page layout, without data loading (also used by the dev preview).
export function MyAppointmentsView({
  t,
  locale,
  data,
  missed,
  today,
  now,
}: {
  t: Dictionary;
  locale: Locale;
  data: MyAppointments;
  /** Her missed visits that are still open (the notice under the list). */
  missed: MissedVisit[];
  today: string;
  /** The current time (ISO), for requests whose time has passed. */
  now: string;
}) {
  const a = t.myAppointments;
  const proposals = data.upcoming.filter((item) => item.status === "RESCHEDULED");
  const open = data.upcoming.filter((item) => item.status !== "RESCHEDULED");
  // Her soonest confirmed visit; with none confirmed, her soonest request.
  const next = open.find((item) => item.status === "CONFIRMED") ?? open.find((item) => item.status === "REQUESTED") ?? null;
  const upcoming = open.filter((item) => item !== next);

  const center = SITE.healthCenter;
  const clinicRows = [
    { label: t.today.address, value: center.address },
    { label: t.today.hours, value: center.clinicHours[locale] },
    ...(isPlaceholder(center.contactNumber) ? [] : [{ label: t.today.contact, value: center.contactNumber }]),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{a.title}</h1>
          <p className="mt-2 max-w-[56ch] text-ink-soft">{a.intro}</p>
        </div>
        {data.pregnancyId && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/mother/appointments/new">
              <PlusIcon weight="bold" aria-hidden />
              {a.request}
            </Link>
          </Button>
        )}
      </div>

      {!data.pregnancyId && (
        <p className="flex items-start gap-2.5 rounded-2xl bg-white px-5 py-4 text-ink-soft shadow-[var(--shadow-soft)]">
          <InfoIcon aria-hidden className="mt-0.5 size-5 shrink-0" />
          {a.noPregnancy}
        </p>
      )}

      {proposals.map((item) => (
        <ProposalBanner key={item.id} t={t} locale={locale} item={item} />
      ))}

      {next && <NextVisitCard t={t} locale={locale} item={next} today={today} now={now} />}

      {/* Phones: the list, the missed notice, then the clinic info. Laptops:
          the list with the clinic info beside it, the notice below both. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
        <VisitTabs
          tabs={[
            {
              label: `${a.upcoming} · ${upcoming.length}`,
              panel: (
                <VisitList
                  items={upcoming}
                  empty={next ? a.noOtherVisits : a.upcomingEmpty}
                  render={(item) => <VisitCard t={t} locale={locale} item={item} today={today} now={now} />}
                />
              ),
            },
            {
              label: `${a.past} · ${data.past.length}`,
              panel: (
                <VisitList
                  items={data.past}
                  empty={a.pastEmpty}
                  render={(item) => <VisitCard t={t} locale={locale} item={item} today={today} now={now} past />}
                />
              ),
            },
          ]}
        />
        <MissedVisitNotice t={t} locale={locale} missed={missed} className="lg:col-span-2 lg:row-start-2" />
        <ClinicInfo
          title={a.clinicInfo}
          rows={clinicRows}
          bringTitle={a.whatToBring}
          items={[a.booklet]}
          visitKey={String(next?.id ?? "none")}
          className="lg:col-start-2 lg:row-start-1"
        />
      </div>
    </div>
  );
}

/**
 * Her next visit, big and green: when, what, the way there, and her calendar.
 * Tablets and laptops: the service's illustration fills its right side.
 */
function NextVisitCard({ t, locale, item, today, now }: { t: Dictionary; locale: Locale; item: MyAppointment; today: string; now: string }) {
  const a = t.myAppointments;
  const { at, isRequest, canCancel, datePassed, reminder } = visitState(item, today, now);
  const confirmed = item.status === "CONFIRMED";
  const ics = visitCalendarFile({
    id: item.id,
    title: `${item.service} · ${SITE.name}`,
    at,
    location: SITE.healthCenter.address,
    note: a.bringBooklet,
    stamp: now,
  });
  const fileName = `${item.service.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${manilaSlot(at).date}.ics`;
  const notes = datePassed || reminder || item.remarks || !canCancel;

  return (
    <section
      aria-labelledby="next-visit"
      className="rounded-3xl bg-leaf p-6 text-white shadow-[var(--shadow-soft)] sm:p-8 md:grid md:grid-cols-[minmax(0,1fr)_13rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]"
    >
      <div className="min-w-0 md:flex md:flex-col">
        {/* Top row: what this card is, its status, and the ⋯ menu. Phones (too
            narrow for Filipino words in one row): the status on its own line
            under "Next visit". */}
        <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2">
          <h2 id="next-visit" className="mr-auto text-xs font-bold tracking-[0.12em] text-white/75 uppercase">
            {t.today.visits.next}
          </h2>
          <div className="order-last w-full sm:order-none sm:w-auto">
            <VisitStatusTag t={t} status={item.status} size="sm" className="h-auto min-h-8 max-w-full py-1 leading-5 whitespace-normal" />
          </div>
          {canCancel && <VisitMenu appointmentId={item.id} isRequest={isRequest} onDark className="-mr-1" />}
        </div>
        <p className="tnum mt-4 text-[1.75rem] leading-9 font-extrabold tracking-[-0.02em] sm:text-[2rem] sm:leading-10">{dayAndTime(t, locale, at, today)}</p>
        <p className="mt-1 text-white/80">
          {item.service}
          <span aria-hidden> · </span>
          <span className="whitespace-nowrap">
            {manilaDate(at, locale, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </p>

        {/* Phones: two equal halves, words only; wider: icons too. */}
        {confirmed && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap [&_svg]:hidden sm:[&_svg]:block">
            <Button asChild variant="secondary" className="h-auto min-h-11 px-4 py-2 text-center whitespace-normal text-leaf shadow-none hover:bg-mint sm:px-6">
              <a href={directionsHref(SITE.healthCenter.address)} target="_blank" rel="noopener noreferrer">
                <LocationIcon aria-hidden />
                {a.directions}
                <span className="sr-only"> {a.newTab}</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto min-h-11 border-white/45 px-4 py-2 text-center whitespace-normal text-white hover:border-white/80 hover:bg-white/10 sm:px-6"
            >
              <a href={calendarHref(ics)} download={fileName}>
                <CalendarPlusIcon aria-hidden />
                {a.addToCalendar}
              </a>
            </Button>
          </div>
        )}

        {/* Tablets and up: a stretchy spacer (at least 24px) pushes the notes down. */}
        {notes && <div aria-hidden className="hidden md:block md:min-h-6 md:flex-1" />}
        {notes && (
          <ul className="mt-6 flex flex-col gap-2 border-t border-white/20 pt-4 text-sm text-white/85 md:mt-0">
            {datePassed && (
              <Detail icon={ClockIcon} tone="dark">
                <span className="font-semibold text-white">{a.datePassed}</span> {a.datePassedNote}
              </Detail>
            )}
            {reminder && (
              <li>
                <ReminderNote t={t} locale={locale} reminder={reminder} onDark />
              </li>
            )}
            {item.remarks && (
              <Detail icon={NoteIcon} tone="dark">
                <span className="font-medium text-white">{a.note}:</span> {item.remarks}
              </Detail>
            )}
            {!canCancel && (
              <Detail icon={PhoneIcon} tone="dark">
                {a.callToCancel}
              </Detail>
            )}
          </ul>
        )}
      </div>
      <div className="hidden items-center justify-center rounded-2xl bg-white p-4 md:flex">
        <ServiceIllustration icon={item.icon} className="max-w-64" />
      </div>
    </section>
  );
}

function VisitList({ items, empty, render }: { items: MyAppointment[]; empty: string; render: (item: MyAppointment) => ReactNode }) {
  if (items.length === 0) return <p className="rounded-3xl bg-white p-6 text-center text-ink-soft shadow-[var(--shadow-soft)]">{empty}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>{render(item)}</li>
      ))}
    </ul>
  );
}

/**
 * One visit in the list: the date tile, day and time, service and status, and
 * the ⋯ menu while it can still be cancelled online. Padding 16px (phones) or
 * 20px around 12px tiles, in a 28px or 32px card (corners that share a center).
 */
function VisitCard({
  t,
  locale,
  item,
  today,
  now,
  past = false,
}: {
  t: Dictionary;
  locale: Locale;
  item: MyAppointment;
  today: string;
  now: string;
  past?: boolean;
}) {
  const a = t.myAppointments;
  const { at, isRequest, canCancel, datePassed, reminder } = visitState(item, today, now);
  const notes = !past && (datePassed || reminder || item.remarks || !canCancel);
  return (
    <article className="relative flex gap-4 rounded-[1.75rem] bg-white p-4 shadow-[var(--shadow-soft)] sm:rounded-[2rem] sm:p-5">
      <VisitDateTile iso={at} locale={locale} status={item.status} className={cn("self-start", item.status === "CONFIRMED" && "bg-mint text-leaf")} />
      <div className="min-w-0 flex-1">
        <h3 className={cn("tnum text-lg leading-7 font-bold", !past && canCancel && "pr-10")}>{dayAndTime(t, locale, at, today)}</h3>
        <p className="break-words text-ink-soft">{item.service}</p>
        <VisitStatusTag t={t} status={item.status} size="sm" className="mt-2 h-auto min-h-8 max-w-full py-1 leading-5 whitespace-normal" />
        {notes && (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {datePassed && (
              <Detail icon={ClockIcon} tone="rose">
                <span className="font-semibold text-rose-deep">{a.datePassed}</span> {a.datePassedNote}
              </Detail>
            )}
            {reminder && (
              <li>
                <ReminderNote t={t} locale={locale} reminder={reminder} />
              </li>
            )}
            {item.remarks && (
              <Detail icon={NoteIcon}>
                <span className="font-medium text-ink">{a.note}:</span> {item.remarks}
              </Detail>
            )}
            {!canCancel && <Detail icon={PhoneIcon}>{a.callToCancel}</Detail>}
          </ul>
        )}
      </div>
      {!past && canCancel && <VisitMenu appointmentId={item.id} isRequest={isRequest} className="absolute top-2 right-2 sm:top-3 sm:right-3" />}
    </article>
  );
}

/** A new time from the health center, to accept or decline, above the timeline. */
function ProposalBanner({ t, locale, item }: { t: Dictionary; locale: Locale; item: MyAppointment }) {
  const a = t.myAppointments;
  const at = item.scheduledAt!;
  return (
    <section aria-labelledby={`proposal-${item.id}`} className="grid gap-6 rounded-3xl bg-blush/70 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0">
        <h2 id={`proposal-${item.id}`} className="flex items-start gap-2 text-lg leading-7 font-bold text-rose-deep">
          <InfoIcon weight="fill" aria-hidden className="mt-1 size-5 shrink-0" />
          {a.proposedTitle}
        </h2>
        <p className="mt-1 text-[0.95rem] text-ink-soft">{a.proposedBody}</p>
        <p className="mt-5 font-semibold">{item.service}</p>
        <p className="tnum text-xl leading-7 font-bold tracking-[-0.01em]">
          {manilaDate(at, locale, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
          <span aria-hidden className="font-normal text-ink-soft">
            {" "}
            ·{" "}
          </span>
          <span className="whitespace-nowrap">{formatSlotClock(at, locale)}</span>
        </p>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          <Detail icon={ClockIcon}>
            {format(a.youAsked, {
              when: unbroken(formatSlot(item.requestedAt, locale, "short")),
            })}
          </Detail>
          {item.remarks && (
            <Detail icon={NoteIcon}>
              <span className="font-medium text-ink">{a.note}:</span> {item.remarks}
            </Detail>
          )}
        </ul>
      </div>
      <ProposalActions appointmentId={item.id} />
    </section>
  );
}

/** One extra line under a visit: an icon and its text. "dark": on the green card. */
function Detail({ icon: DetailIcon, tone = "soft", children }: { icon: Icon; tone?: "soft" | "rose" | "dark"; children: ReactNode }) {
  return (
    <li className={cn("flex items-start gap-2 break-words", tone === "dark" ? "text-white/85" : "text-ink-soft")}>
      <DetailIcon
        weight={tone === "rose" ? "bold" : "regular"}
        aria-hidden
        className={cn("mt-0.5 size-4 shrink-0", tone === "rose" ? "text-rose-deep" : tone === "dark" ? "text-white/75" : "text-leaf")}
      />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Her text reminder: when and where it goes, that it went, or that it couldn't (a not-needed one shows nothing). */
function ReminderNote({ t, locale, reminder, onDark = false }: { t: Dictionary; locale: Locale; reminder: MyReminder; onDark?: boolean }) {
  const r = t.myAppointments.reminder;
  if (reminder.status === "SKIPPED") return null;
  if (reminder.status === "FAILED") {
    // Only a number the sender couldn't use is hers to fix; any other failure is on our side.
    const tone = onDark ? "text-blush" : "text-rose-deep";
    return (
      <p className={cn("flex items-start gap-2 text-sm", tone)}>
        <ReminderIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
        {reminder.reason === "bad_number" ? (
          <span>
            {r.failedNumber}{" "}
            <Link href="/mother/profile" className={cn("font-semibold underline decoration-1 underline-offset-4 hover:decoration-2", tone)}>
              {r.checkNumber}
            </Link>
          </span>
        ) : (
          <span>{r.failed}</span>
        )}
      </p>
    );
  }
  const when = formatSlot(reminder.status === "PENDING" ? reminder.at : (reminder.sentAt ?? reminder.at), locale, "short").replace(/ /g, " ");
  return (
    <p className={cn("tnum flex items-start gap-2 text-sm", onDark ? "text-white/85" : "text-ink-soft")}>
      <ReminderIcon aria-hidden className={cn("mt-0.5 size-4 shrink-0", onDark ? "text-white/75" : "text-leaf")} />
      <span>{reminder.status === "PENDING" ? format(r.waiting, { when, number: reminder.number }) : format(r.sent, { when })}</span>
    </p>
  );
}
