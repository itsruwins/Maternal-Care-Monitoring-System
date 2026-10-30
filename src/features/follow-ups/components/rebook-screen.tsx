import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeftIcon, CheckCircleIcon, LocationIcon, PhoneIcon, PregnancyIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { BookAppointmentForm } from "@/features/appointments/components/book-appointment-form";
import { findBookableMothers, getStaffSlotData, listServices } from "@/features/appointments/queries/appointments";
import type { BookableMother, Service, SlotData } from "@/features/appointments/types";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot } from "@/lib/appointments/format";
import { firstOpenDay } from "@/lib/appointments/slots";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { addDays, formatDate } from "@/lib/utils/pregnancy";
import { getFollowUpItem } from "../queries/follow-ups";
import type { FollowUpItem } from "../types";
import { endingText } from "./follow-up-bits";

// /staff/follow-ups/[appointmentId]/rebook: book a new appointment for a
// missed visit. Starts with the missed service and the first open weekday
// from tomorrow; booking it moves the item to Closed ("Rebooked"). Reads the
// session: render inside <Suspense>.
export async function RebookScreen({ params }: { params: Promise<{ appointmentId: string }> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const { appointmentId } = await params;
  const today = manilaTodayISO();
  const item = /^[1-9]\d{0,9}$/.test(appointmentId) ? await getFollowUpItem(Number(appointmentId), { isAdmin: user.role === "ADMIN" }, today) : null;
  if (!item) notFound();
  const [{ t, locale }, [mother], services, slots] = await Promise.all([
    getServerI18n(),
    findBookableMothers({ id: item.mother.id }, today),
    listServices(),
    getStaffSlotData(today),
  ]);
  return (
    <RebookView
      t={t}
      locale={locale}
      item={item}
      mother={mother ?? null}
      services={services}
      slots={slots}
      suggested={firstOpenDay(addDays(today, 1)!, slots)}
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function RebookView({
  t,
  locale,
  item,
  mother,
  services,
  slots,
  suggested,
}: {
  t: Dictionary;
  locale: Locale;
  item: FollowUpItem;
  mother: BookableMother | null;
  services: Service[];
  slots: SlotData;
  suggested: string | null;
}) {
  const r = t.followUps.rebookPage;
  const missedService = services.some((service) => service.id === item.serviceId) ? item.serviceId : null;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/follow-ups"
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {r.back}
      </Link>
      <div>
        <h1 className="text-title font-extrabold">{r.title}</h1>
        <p className="mt-2 max-w-[60ch] text-ink-soft">
          {format(r.intro, { name: item.mother.name, service: item.service, when: formatSlot(item.missedAt, locale, "short") })}
        </p>
      </div>

      {!item.isOpen && item.ending ? (
        <section className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <IconCircle icon={CheckCircleIcon} tone="mint" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{r.sortedTitle}</h2>
            <p className="mt-1 text-ink-soft">{format(r.sortedBody, { ending: endingText(t, locale, item.ending) })}</p>
          </div>
        </section>
      ) : !mother ? (
        <p className="rounded-2xl bg-white px-6 py-8 text-center text-ink-soft shadow-[var(--shadow-soft)]">{r.noPregnancy}</p>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
            <IconCircle icon={PregnancyIcon} tone="blush" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold break-words">{mother.name}</p>
              <p className="tnum flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon aria-hidden className="size-4" />
                  {mother.contactNumber}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LocationIcon aria-hidden className="size-4" />
                  {item.mother.purok ?? t.followUps.noPurokYet}
                </span>
                {mother.weeks !== null && <span>{format(t.appointments.bookPage.week, { weeks: mother.weeks })}</span>}
              </p>
            </div>
          </section>
          {suggested && <p className="-mb-2 text-ink-soft">{format(r.suggestion, { date: formatDate(suggested, locale) })}</p>}
          <BookAppointmentForm
            mother={mother}
            services={services}
            slots={slots}
            initialServiceId={missedService}
            initialDate={suggested}
            doneHref="/staff/follow-ups"
          />
        </>
      )}
    </div>
  );
}
