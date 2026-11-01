import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import type { SlotError } from "@/lib/appointments/slots";
import type { AppointmentStatus, SmsDeliveryStatus } from "@/types/database";

export type MyAppointment = {
  id: number;
  service: string;
  status: AppointmentStatus;
  /** Her preferred time (what she asked for). */
  requestedAt: string;
  /** The confirmed or proposed time, if any. */
  scheduledAt: string | null;
  remarks: string | null;
  /** The latest visit reminder text for it (confirmed visits only), or null. */
  reminder: MyReminder | null;
};

/** at: when it goes out (or is tried again); sentAt once sent; number: where it goes. */
export type MyReminder = { status: SmsDeliveryStatus; at: string; sentAt: string | null; number: string };

export type MyAppointments = {
  /** Her current pregnancy, or null (no requests then). */
  pregnancyId: number | null;
  upcoming: MyAppointment[];
  past: MyAppointment[];
};

/** A missed visit the health center hasn't sorted out yet (no staff notes). */
export type MissedVisit = { id: number; service: string; at: string };

export type Service = { id: number; name: string; description: string | null; icon: ServiceIconKey };

/** Everything the request form needs to grey out unavailable days and times. */
export type BookingData = {
  services: Service[];
  today: string;
  first: string;
  last: string;
  closedDays: string[];
  /** Taken slots as "YYYY-MM-DDTHH:MM" (Manila). */
  taken: string[];
};

export type ActionResult = { ok: true } | { ok: false; error: SlotError };
