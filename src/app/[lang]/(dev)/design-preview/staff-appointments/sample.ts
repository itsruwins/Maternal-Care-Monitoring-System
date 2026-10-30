import type { SlotData, StaffAppointment } from "@/features/appointments/types";

// Sample data for the staff appointment previews ("today" is 2026-10-27,
// "now" 10:00 AM Manila).
export const SAMPLE_NOW = "2026-10-27T02:00:00Z";

const mother = (id: number, name: string, hasLogin = true) => ({ id, name, contactNumber: "0917123456" + id, hasLogin });

export const SAMPLE_APPOINTMENTS: StaffAppointment[] = [
  { id: 1, status: "REQUESTED", requestedAt: "2026-11-03T01:00:00Z", scheduledAt: null, at: "2026-11-03T01:00:00Z", remarks: "First checkup", createdAt: "2026-10-25T03:10:00Z", service: "Prenatal Checkup", mother: mother(1, "Ana Marie Bautista"), reminder: null },
  { id: 2, status: "REQUESTED", requestedAt: "2026-11-04T05:30:00Z", scheduledAt: null, at: "2026-11-04T05:30:00Z", remarks: null, createdAt: "2026-10-26T08:45:00Z", service: "Laboratory Test", mother: mother(2, "Carla Dela Cruz", false), reminder: null },
  { id: 3, status: "CONFIRMED", requestedAt: "2026-11-05T01:00:00Z", scheduledAt: "2026-11-05T01:00:00Z", at: "2026-11-05T01:00:00Z", remarks: null, createdAt: "2026-10-20T01:00:00Z", service: "Tetanus Toxoid Vaccination", mother: mother(3, "Grace Mendoza"), reminder: { status: "PENDING", at: "2026-11-04T00:00:00Z", sentAt: null } },
  { id: 4, status: "RESCHEDULED", requestedAt: "2026-11-05T02:00:00Z", scheduledAt: "2026-11-05T05:00:00Z", at: "2026-11-05T05:00:00Z", remarks: "Morning slots are full that day.", createdAt: "2026-10-21T01:00:00Z", service: "Iron / Folic Acid Supplementation", mother: mother(4, "Joy Ramos"), reminder: null },
  // A request nobody answered before its time.
  { id: 5, status: "REQUESTED", requestedAt: "2026-10-26T01:00:00Z", scheduledAt: null, at: "2026-10-26T01:00:00Z", remarks: null, createdAt: "2026-10-22T02:15:00Z", service: "Prenatal Checkup", mother: mother(5, "Liza Santos"), reminder: null },
  { id: 6, status: "MISSED", requestedAt: "2026-10-23T02:00:00Z", scheduledAt: "2026-10-23T02:00:00Z", at: "2026-10-23T02:00:00Z", remarks: null, createdAt: "2026-10-15T01:00:00Z", service: "Tetanus Toxoid Vaccination", mother: mother(6, "Maria Clara Reyes"), reminder: { status: "DELIVERED", at: "2026-10-22T00:00:00Z", sentAt: "2026-10-22T00:00:05Z" } },
];

export const SAMPLE_SLOTS: SlotData = {
  first: "2026-10-27",
  last: "2027-04-27",
  closedDays: ["2026-11-02", "2026-11-30"],
  taken: ["2026-11-03T09:00", "2026-11-04T13:30", "2026-11-05T09:00", "2026-11-05T13:00"],
};
