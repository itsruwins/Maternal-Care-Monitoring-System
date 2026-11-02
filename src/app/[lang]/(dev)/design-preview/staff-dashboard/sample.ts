import type { AdminDashboard, DashboardCounts, DueSoonItem } from "@/features/dashboard/types";
import type { TodayAppointment } from "@/features/visits/types";

// Sample data for the staff dashboard preview (Mon, Nov 2, 2026).
export const SAMPLE_TODAY_DATE = "2026-11-02";

export const SAMPLE_COUNTS: Omit<DashboardCounts, "dueSoon"> = { today: 4, requests: 2, followUps: 3, pregnant: 41 };

export const SAMPLE_TODAY: TodayAppointment[] = [
  { id: 1, at: "2026-11-02T00:30:00Z", status: "COMPLETED", service: "Prenatal Checkup", mother: { id: 1, name: "Ana Marie Bautista" }, visitId: 7, dayVisitId: null },
  { id: 2, at: "2026-11-02T01:00:00Z", status: "CONFIRMED", service: "Tetanus Toxoid Vaccination", mother: { id: 2, name: "Carla Dela Cruz" }, visitId: null, dayVisitId: null },
  { id: 3, at: "2026-11-02T02:30:00Z", status: "CONFIRMED", service: "Iron / Folic Acid Supplementation", mother: { id: 4, name: "Rosalinda Macaraeg-Villanueva" }, visitId: null, dayVisitId: null },
  { id: 4, at: "2026-11-02T05:30:00Z", status: "RESCHEDULED", service: "Nutrition Counseling", mother: { id: 3, name: "Grace Mendoza" }, visitId: null, dayVisitId: null },
];

export const SAMPLE_DUE: DueSoonItem[] = [
  { pregnancyId: 11, motherId: 6, name: "Liza Santos", purok: "Purok 3", dueDate: "2026-10-28", daysLeft: -5, weeks: 40 },
  { pregnancyId: 12, motherId: 7, name: "Jocelyn Reyes", purok: "Purok 7", dueDate: "2026-11-01", daysLeft: -1, weeks: 40 },
  { pregnancyId: 13, motherId: 8, name: "Maricel Ann Dimaculangan", purok: null, dueDate: "2026-11-02", daysLeft: 0, weeks: 40 },
  { pregnancyId: 14, motherId: 9, name: "Kristine Bañares", purok: "Purok 1", dueDate: "2026-11-03", daysLeft: 1, weeks: 39 },
  { pregnancyId: 15, motherId: 10, name: "Angelica Ramos", purok: "Purok 10", dueDate: "2026-11-19", daysLeft: 17, weeks: 37 },
  { pregnancyId: 16, motherId: 11, name: "Divina Gracia Lim", purok: "Purok 5", dueDate: "2026-11-30", daysLeft: 28, weeks: 36 },
];

export const SAMPLE_ADMIN: AdminDashboard = {
  accounts: {
    mothers: 58,
    mothersWithLogin: 31,
    mothersWithoutLogin: 27,
    signedUpThisMonth: 4,
    healthWorkers: 5,
    admins: 1,
    inactive: 2,
  },
  sms: {
    phoneOnline: true,
    phoneStatusAt: "2026-11-02T00:02:00Z",
    limitReachedAt: null,
    sentThisMonth: 42,
    deliveredThisMonth: 39,
    failedThisMonth: 1,
    skippedThisMonth: 3,
    waiting: 2,
    failed: 1,
    limit: 200,
  },
};
