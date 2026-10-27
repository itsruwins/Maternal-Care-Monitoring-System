import Link from "next/link";
import { InfoIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot, formatSlotClock, formatSlotDate, slotTile } from "@/lib/appointments/format";
import { manilaSlot } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { cn } from "@/lib/utils/cn";
import type { AppointmentStatus } from "@/types/database";
import { getMyAppointments } from "../queries/get-my-appointments";
import type { MyAppointment, MyAppointments } from "../types";
import { CancelVisitButton, ProposalActions } from "./appointment-actions";

// /mother/appointments: new times to answer first, then upcoming visits (with
// Cancel when allowed) and past ones. Reads the session: render inside <Suspense>.
export async function MyAppointmentsScreen() {
  const user = await requireRole(AREA_ROLES.mother);
  const [{ t, locale }, data] = await Promise.all([getServerI18n(), getMyAppointments(user)]);
  return <MyAppointmentsView t={t} locale={locale} data={data} today={manilaTodayISO()} />;
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  REQUESTED: "border border-dashed border-leaf text-leaf",
  CONFIRMED: "bg-mint text-leaf",
  RESCHEDULED: "bg-blush text-rose-deep",
  COMPLETED: "bg-mint text-leaf",
  MISSED: "bg-blush text-rose-deep",
  CANCELLED: "bg-cream text-ink-soft",
};

// The page layout, without data loading (also used by the dev preview).
export function MyAppointmentsView({ t, locale, data, today }: { t: Dictionary; locale: Locale; data: MyAppointments; today: string }) {
  const a = t.myAppointments;
  const proposals = data.upcoming.filter((item) => item.status === "RESCHEDULED");
  const upcoming = data.upcoming.filter((item) => item.status !== "RESCHEDULED");

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
        <section key={item.id} aria-labelledby={`proposal-${item.id}`} className="rounded-3xl bg-blush/70 p-5 sm:p-7">
          <p id={`proposal-${item.id}`} className="text-lg font-bold">
            {a.proposedTitle}
          </p>
          <p className="mt-1 text-[0.95rem] text-ink-soft">{a.proposedBody}</p>
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4">
            <DateTile iso={item.scheduledAt!} locale={locale} />
            <div className="min-w-0">
              <p className="font-semibold break-words">{item.service}</p>
              <p className="tnum text-[0.95rem]">{formatSlot(item.scheduledAt!, locale)}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{format(a.youAsked, { when: formatSlot(item.requestedAt, locale, "short") })}</p>
            </div>
          </div>
          {item.remarks && <p className="mt-3 text-sm break-words text-ink-soft">{item.remarks}</p>}
          <div className="mt-4">
            <ProposalActions appointmentId={item.id} />
          </div>
        </section>
      ))}

      <section aria-labelledby="upcoming-visits" className="flex flex-col gap-3">
        <h2 id="upcoming-visits" className="text-lg font-bold">
          {a.upcoming}
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{a.upcomingEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((item) => (
              <li key={item.id}>
                <UpcomingCard t={t} locale={locale} item={item} today={today} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.past.length > 0 && (
        <section aria-labelledby="past-visits" className="flex flex-col gap-3">
          <h2 id="past-visits" className="text-lg font-bold">
            {a.past}
          </h2>
          <ul className="divide-y divide-line rounded-3xl bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
            {data.past.map((item) => {
              const at = item.scheduledAt ?? item.requestedAt;
              return (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5">
                  <span className="min-w-0">
                    <span className="block font-medium break-words">{item.service}</span>
                    <span className="tnum block text-sm text-ink-soft">{formatSlot(at, locale, "short")}</span>
                  </span>
                  <StatusChip t={t} status={item.status} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function UpcomingCard({ t, locale, item, today }: { t: Dictionary; locale: Locale; item: MyAppointment; today: string }) {
  const a = t.myAppointments;
  const at = item.scheduledAt ?? item.requestedAt;
  const isRequest = item.status === "REQUESTED";
  // Confirmed visits can be cancelled online until the day before.
  const canCancel = isRequest || manilaSlot(at).date > today;

  return (
    <article className="flex gap-4 rounded-3xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <DateTile iso={at} locale={locale} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold break-words">{item.service}</h3>
            <p className="tnum text-[0.95rem] text-ink-soft">
              {formatSlotDate(at, locale)} · <span className="font-semibold text-ink">{formatSlotClock(at, locale)}</span>
            </p>
          </div>
          <StatusChip t={t} status={item.status} />
        </div>
        {item.remarks && (
          <p className="text-sm break-words text-ink-soft">
            <span className="font-medium text-ink">{a.note}:</span> {item.remarks}
          </p>
        )}
        <div className="-ml-3">
          {canCancel ? <CancelVisitButton appointmentId={item.id} isRequest={isRequest} /> : <p className="ml-3 text-sm text-ink-soft">{a.callToCancel}</p>}
        </div>
      </div>
    </article>
  );
}

function DateTile({ iso, locale }: { iso: string; locale: Locale }) {
  const tile = slotTile(iso, locale);
  return (
    <span aria-hidden className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-mint text-leaf">
      <span className="text-caption font-semibold">{tile.month}</span>
      <span className="tnum text-2xl leading-none font-extrabold">{tile.day}</span>
    </span>
  );
}

function StatusChip({ t, status }: { t: Dictionary; status: AppointmentStatus }) {
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap", STATUS_STYLE[status])}>
      {t.myAppointments.statuses[status]}
    </span>
  );
}

