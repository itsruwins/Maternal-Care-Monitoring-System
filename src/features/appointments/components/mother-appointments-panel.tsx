import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot } from "@/lib/appointments/format";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { getStaffSlotData, listMotherAppointments } from "../queries/appointments";
import type { SlotData, StaffAppointment } from "../types";
import { FollowUpsLink, StatusChip } from "./appointment-bits";
import { AppointmentCard } from "./appointment-card";

const OPEN = new Set(["REQUESTED", "CONFIRMED", "RESCHEDULED"]);

// The Appointments tab on a mother's record: Book (with a current pregnancy),
// open appointments with their actions (requests stay here after their time
// passes, until staff move or cancel them), then past ones. Loads its own data
// (the page has already checked the staff role).
export async function MotherAppointmentsPanel({ motherId, canBook }: { motherId: number; canBook: boolean }) {
  const today = manilaTodayISO();
  const [{ t, locale }, items, slots] = await Promise.all([getServerI18n(), listMotherAppointments(motherId), getStaffSlotData(today)]);
  return <MotherAppointmentsPanelView t={t} locale={locale} motherId={motherId} canBook={canBook} items={items} slots={slots} now={new Date().toISOString()} today={today} />;
}

export function MotherAppointmentsPanelView({
  t,
  locale,
  motherId,
  canBook,
  items,
  slots,
  now,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  motherId: number;
  canBook: boolean;
  items: StaffAppointment[];
  slots: SlotData;
  /** The current instant (ISO), to split upcoming from past. */
  now: string;
  /** Manila date, for "Record visit" on today's appointments. */
  today?: string;
}) {
  const r = t.appointments.record;
  const upcoming = items.filter((item) => OPEN.has(item.status) && (item.status === "REQUESTED" || Date.parse(item.at) > Date.parse(now)));
  const past = items.filter((item) => !upcoming.includes(item)).reverse();

  return (
    <div className="flex flex-col gap-6">
      {canBook && (
        <div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/staff/appointments/new?mother=${motherId}`}>
              <PlusIcon weight="bold" aria-hidden />
              {r.book}
            </Link>
          </Button>
        </div>
      )}
      {items.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{r.empty}</p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section aria-labelledby="her-upcoming" className="flex flex-col gap-3">
              <h2 id="her-upcoming" className="text-lg font-bold">
                {r.upcoming}
              </h2>
              <ul className="grid gap-3 lg:grid-cols-2">
                {upcoming.map((item) => (
                  <li key={item.id}>
                    <AppointmentCard t={t} locale={locale} appointment={item} slots={slots} showMother={false} today={today} now={now} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section aria-labelledby="her-past" className="flex flex-col gap-3">
              <h2 id="her-past" className="text-lg font-bold">
                {r.past}
              </h2>
              <ul className="divide-y divide-line rounded-3xl bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
                {past.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5">
                    <span className="min-w-0">
                      <span className="block font-medium break-words">{item.service}</span>
                      <span className="tnum block text-sm text-ink-soft">{formatSlot(item.at, locale, "short")}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      {item.status === "MISSED" && <FollowUpsLink t={t} mother={item.mother} />}
                      <StatusChip t={t} status={item.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
