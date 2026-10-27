import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import type { SlotError } from "@/lib/appointments/slots";
import type { AppointmentStatus, SmsDeliveryStatus } from "@/types/database";

export type StaffAppointment = {
  id: number;
  status: AppointmentStatus;
  /** What the mother asked for (or the booked time for staff bookings). */
  requestedAt: string;
  /** Confirmed or proposed time. */
  scheduledAt: string | null;
  /** The slot it holds: scheduled time, or requested time while a request. */
  at: string;
  remarks: string | null;
  createdAt: string;
  service: string;
  mother: { id: number; name: string; contactNumber: string; hasLogin: boolean };
  reminder: { status: SmsDeliveryStatus; at: string; sentAt: string | null } | null;
};

export type AppointmentFilters = {
  status: AppointmentStatus | "";
  service: number | "";
  from: string;
  to: string;
  page: number;
};

/** Days and taken times for picking a slot (staff: today up to 6 months). */
export type SlotData = { first: string; last: string; closedDays: string[]; taken: string[] };

export type Service = { id: number; name: string; icon: ServiceIconKey };

export type BookableMother = { id: number; pregnancyId: number; name: string; contactNumber: string; weeks: number | null };

export type ActionResult = { ok: true; status?: AppointmentStatus } | { ok: false; error: SlotError };
