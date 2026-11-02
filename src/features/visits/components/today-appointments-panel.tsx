import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { listTodayAppointments } from "../queries/visits";
import { TodayAppointmentsList } from "./today-appointments-list";

// Today's appointments, loaded here, for the staff dashboard's slot (one per
// row). Reads the session: render inside <Suspense>.
export async function TodayAppointmentsPanel() {
  await requireRole(AREA_ROLES.staff);
  const [{ t, locale }, items] = await Promise.all([getServerI18n(), listTodayAppointments(manilaTodayISO())]);
  return <TodayAppointmentsList t={t} locale={locale} items={items} columns={1} />;
}
