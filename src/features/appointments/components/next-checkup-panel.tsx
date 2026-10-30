import { format } from "@/i18n/format";
import { getServerI18n } from "@/i18n/server";
import { firstOpenDay } from "@/lib/appointments/slots";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { addDays, formatDate } from "@/lib/utils/pregnancy";
import { nextCheckupInDays } from "@/lib/visits/vitals";
import { findBookableMothers, getStaffSlotData, listServices } from "../queries/appointments";
import { BookAppointmentForm } from "./book-appointment-form";

// "Book her next checkup?" after a visit: the booking form, starting with the
// checkup service and the first open weekday on or after the usual interval
// (about 4 weeks; 2 from week 28; 1 from week 36). Loads its own data (the
// page has already checked the staff role).
export async function NextCheckupPanel({ motherId, weeks, doneHref }: { motherId: number; weeks: number | null; doneHref: string }) {
  const today = manilaTodayISO();
  const [{ t, locale }, [mother], services, slots] = await Promise.all([
    getServerI18n(),
    findBookableMothers({ id: motherId }, today),
    listServices(),
    getStaffSlotData(today),
  ]);
  if (!mother) return null;

  const days = nextCheckupInDays(weeks);
  const suggested = firstOpenDay(addDays(today, days)!, slots);
  const checkup = services.find((s) => s.icon === "checkup") ?? null;
  const n = t.visits.next;

  return (
    <section aria-labelledby="next-checkup" className="flex flex-col gap-4">
      <div>
        <h2 id="next-checkup" className="text-xl font-bold">
          {n.title}
        </h2>
        {suggested && <p className="mt-1 text-ink-soft">{format(n.suggestion, { date: formatDate(suggested, locale), days })}</p>}
      </div>
      <BookAppointmentForm
        mother={mother}
        services={services}
        slots={slots}
        initialServiceId={checkup?.id ?? null}
        initialDate={suggested}
        doneHref={doneHref}
      />
    </section>
  );
}
