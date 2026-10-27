import Link from "next/link";
import { redirect } from "next/navigation";
import { CaretLeftIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { getBookingData } from "../queries/get-booking-data";
import { getMyAppointments } from "../queries/get-my-appointments";
import type { BookingData } from "../types";
import { RequestVisitForm } from "./request-visit-form";

// /mother/appointments/new. Only with a current pregnancy. Reads the session:
// render inside <Suspense>.
export async function RequestVisitScreen() {
  const user = await requireRole(AREA_ROLES.mother);
  const mine = await getMyAppointments(user);
  if (!mine.pregnancyId) redirect("/mother/appointments");
  const [{ t }, data] = await Promise.all([getServerI18n(), getBookingData(manilaTodayISO())]);
  return <RequestVisitView t={t} data={data} />;
}

// The page layout, without data loading (also used by the dev preview).
export function RequestVisitView({ t, data }: { t: Dictionary; data: BookingData }) {
  const n = t.myAppointments.new;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/mother/appointments"
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {n.back}
      </Link>
      <div>
        <h1 className="text-title font-extrabold">{n.title}</h1>
        <p className="mt-2 max-w-[56ch] text-ink-soft">{n.intro}</p>
      </div>
      <RequestVisitForm data={data} />
    </div>
  );
}
