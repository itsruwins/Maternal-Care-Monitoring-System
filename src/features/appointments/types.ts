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
  /** retryAt: when a failed reminder is tried again; reason: why it failed or wasn't sent (sms_reminder.status_reason). */
  reminder: { status: SmsDeliveryStatus; at: string; sentAt: string | null; retryAt: string | null; reason: string | null } | null;
};

/**
 * The List's status tabs: "" is everything but cancelled; "upcoming" is
 * confirmed or new time sent, from today on; the rest are one status each.
 */
export type ListTab = "" | "upcoming" | "REQUESTED" | "MISSED" | "COMPLETED" | "CANCELLED";

export type AppointmentFilters = {
  status: ListTab;
  /** Her name or number. */
  q: string;
  service: number | "";
  from: string;
  to: string;
  page: number;
};

/** How many appointments each List tab holds, with the search, service and dates applied. */
export type ListTabCounts = Record<"all" | "upcoming" | "REQUESTED" | "MISSED" | "COMPLETED" | "CANCELLED", number>;

/** The four counts above the views. */
export type HubCounts = {
  /** Requests waiting for an answer. */
  requests: number;
  /** Not cancelled, today (Manila). */
  today: number;
  /** Not cancelled, Monday to Sunday of this week. */
  week: number;
  /** Missed visits still to follow up. */
  missed: number;
};

/** Days and taken times for picking a slot (staff: today up to 6 months). */
export type SlotData = { first: string; last: string; closedDays: string[]; taken: string[] };

export type Service = { id: number; name: string; icon: ServiceIconKey };

export type BookableMother = { id: number; pregnancyId: number; name: string; contactNumber: string; weeks: number | null };

export type ActionResult = { ok: true; status?: AppointmentStatus } | { ok: false; error: SlotError };
