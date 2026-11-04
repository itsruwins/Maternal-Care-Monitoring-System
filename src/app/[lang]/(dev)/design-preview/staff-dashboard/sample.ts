import type {
  AdminDashboard,
  DashboardContext,
  DashboardCounts,
  DueSoonItem,
  FollowUpItem,
  RequestItem,
  VisitDay,
} from "@/features/dashboard/types";
import type { TodayAppointment } from "@/features/visits/types";

// Sample data for the staff dashboard preview (Mon, Nov 2, 2026).
export const SAMPLE_TODAY_DATE = "2026-11-02";

export const SAMPLE_COUNTS: Omit<DashboardCounts, "dueSoon"> = { today: 4, requests: 2, followUps: 3, pregnant: 41 };

export const SAMPLE_CONTEXT: DashboardContext = {
  todayDone: 1,
  todayMissed: 0,
  oldestRequestAt: "2026-10-30T02:15:00Z",
  oldestMissedAt: "2026-10-26T01:00:00Z",
  thirdTrimester: 14,
  pastDue: 2,
};

export const SAMPLE_REQUESTS: RequestItem[] = [
  { appointmentId: 21, motherId: 12, name: "Jennilyn Altura Dugan", service: "Prenatal Checkup", at: "2026-11-04T00:00:00Z" },
  { appointmentId: 22, motherId: 13, name: "Precious Joy Mabini", service: "Birth Plan Counseling", at: "2026-11-05T05:30:00Z" },
];

export const SAMPLE_FOLLOW_UPS: FollowUpItem[] = [
  { appointmentId: 31, motherId: 14, name: "Rowena Cabral", service: "Prenatal Checkup", missedAt: "2026-10-26T01:00:00Z" },
  { appointmentId: 32, motherId: 15, name: "Sheila Mae Ocampo", service: "Tetanus Toxoid Vaccination", missedAt: "2026-10-29T02:30:00Z" },
  { appointmentId: 33, motherId: 16, name: "Lorna Fajardo", service: "Nutrition Counseling", missedAt: "2026-10-30T06:00:00Z" },
];

/** Oct 4 to Nov 2, 2026: weekdays, plus one Saturday with a visit. */
export const SAMPLE_VISITS_BY_DAY: VisitDay[] = (() => {
  const counts = [3, 5, 2, 4, 6, 0, 4, 3, 5, 2, 1, 7, 4, 3, 6, 2, 5, 0, 4, 6, 3, 2];
  const days: VisitDay[] = [];
  let i = 0;
  for (let d = new Date(Date.UTC(2026, 9, 4)); d <= new Date(Date.UTC(2026, 10, 2)); d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const weekday = d.getUTCDay();
    if (date === "2026-10-24") days.push({ date, count: 2 });
    else if (weekday !== 0 && weekday !== 6) days.push({ date, count: counts[i++ % counts.length] });
  }
  days[days.length - 1].count = 1; // today so far
  return days;
})();

export const SAMPLE_TODAY: TodayAppointment[] = [
  { id: 1, at: "2026-11-02T00:30:00Z", status: "COMPLETED", service: "Prenatal Checkup", mother: { id: 1, name: "Ana Marie Bautista", contactNumber: "09171234567" }, weeks: 21, visitId: 7, dayVisitId: null },
  { id: 2, at: "2026-11-02T01:00:00Z", status: "CONFIRMED", service: "Tetanus Toxoid Vaccination", mother: { id: 2, name: "Carla Dela Cruz", contactNumber: "09181112222" }, weeks: 37, visitId: null, dayVisitId: null },
  { id: 3, at: "2026-11-02T02:30:00Z", status: "CONFIRMED", service: "Iron / Folic Acid Supplementation", mother: { id: 4, name: "Rosalinda Macaraeg-Villanueva", contactNumber: "09223456789" }, weeks: 28, visitId: null, dayVisitId: null },
  { id: 4, at: "2026-11-02T05:30:00Z", status: "RESCHEDULED", service: "Nutrition Counseling", mother: { id: 3, name: "Grace Mendoza", contactNumber: "09193334444" }, weeks: 10, visitId: null, dayVisitId: null },
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
