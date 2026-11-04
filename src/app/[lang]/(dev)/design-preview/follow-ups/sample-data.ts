import type { FollowUpEntry, FollowUpItem } from "@/features/follow-ups/types";
import type { PurokOption } from "@/lib/puroks/types";

// Sample data for the follow-up previews ("today" is Friday 2026-11-06).
export const SAMPLE_TODAY = "2026-11-06";

export const SAMPLE_PUROKS: PurokOption[] = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Purok ${i + 1}` }));

const entry = (id: number, values: Omit<FollowUpEntry, "id" | "loggedBy" | "canEdit"> & Partial<Pick<FollowUpEntry, "loggedBy" | "canEdit">>): FollowUpEntry => ({
  id,
  loggedBy: "Joy Dela Cruz",
  canEdit: false,
  ...values,
});

const item = (
  appointmentId: number,
  values: Pick<FollowUpItem, "service" | "missedAt" | "missedDate" | "daysAgo"> &
    Partial<Pick<FollowUpItem, "entries" | "ending" | "isOpen">> & { name: string; purok: string | null },
): FollowUpItem => ({
  appointmentId,
  serviceId: values.service === "Prenatal Checkup" ? 1 : values.service === "Tetanus Toxoid Vaccination" ? 2 : 3,
  service: values.service,
  missedAt: values.missedAt,
  missedDate: values.missedDate,
  daysAgo: values.daysAgo,
  mother: { id: appointmentId, name: values.name, contactNumber: `091712345${String(appointmentId).padStart(2, "0")}`, purok: values.purok },
  isOpen: values.isOpen ?? true,
  ending: values.ending ?? null,
  entries: values.entries ?? [],
});

export const SAMPLE_OPEN: FollowUpItem[] = [
  item(11, {
    name: "Ana Marie Bautista",
    purok: "Purok 3",
    service: "Prenatal Checkup",
    missedAt: "2026-10-27T01:00:00Z",
    missedDate: "2026-10-27",
    daysAgo: 10,
    entries: [
      entry(9, { date: "2026-11-05", method: "HOME_VISIT", result: "NOT_REACHED", notes: "Nobody home. Left a note with a neighbor.", closeReason: null }),
      entry(3, { date: "2026-11-02", method: "CALL", result: "NOT_REACHED", notes: "No answer, rang twice.", closeReason: null }),
      entry(2, { date: "2026-10-29", method: "SMS", result: "NOT_REACHED", notes: "Sent a text from the clinic phone. No reply yet.", closeReason: null, loggedBy: "Rose Villanueva" }),
    ],
  }),
  item(12, { name: "Carla Dela Cruz", purok: null, service: "Tetanus Toxoid Vaccination", missedAt: "2026-11-02T05:30:00Z", missedDate: "2026-11-02", daysAgo: 4 }),
  item(13, {
    name: "Grace Mendoza",
    purok: "Purok 7",
    service: "Iron / Folic Acid Supplementation",
    missedAt: "2026-11-04T02:00:00Z",
    missedDate: "2026-11-04",
    daysAgo: 2,
    entries: [
      entry(4, {
        date: "2026-11-06",
        method: "HOME_VISIT",
        result: "REACHED",
        notes: "She had the flu. Feeling better now and will come next week.",
        closeReason: null,
        loggedBy: "Rose Villanueva",
        canEdit: true,
      }),
    ],
  }),
  item(14, { name: "Joy Ramos", purok: "Purok 1", service: "Prenatal Checkup", missedAt: "2026-11-05T00:30:00Z", missedDate: "2026-11-05", daysAgo: 1 }),
  item(15, {
    name: "Rosalinda Macaraeg-Villanueva",
    purok: "Sitio Upper Tico-tico",
    service: "Iron / Folic Acid Supplementation",
    missedAt: "2026-11-06T00:00:00Z",
    missedDate: "2026-11-06",
    daysAgo: 0,
  }),
];

export const SAMPLE_CLOSED: FollowUpItem[] = [
  item(21, {
    name: "Maria Clara Reyes",
    purok: "Purok 2",
    service: "Prenatal Checkup",
    missedAt: "2026-10-23T06:00:00Z",
    missedDate: "2026-10-23",
    daysAgo: 14,
    isOpen: false,
    ending: { how: "REBOOKED", at: "2026-11-05T03:20:00Z", closeReason: null, rebookedAt: "2026-11-10T01:00:00Z" },
    entries: [entry(5, { date: "2026-11-05", method: "CALL", result: "REACHED", notes: "Her baby's father was in the hospital. Rebooked.", closeReason: null })],
  }),
  item(22, {
    name: "Lorna Santos",
    purok: "Purok 5",
    service: "Tetanus Toxoid Vaccination",
    missedAt: "2026-10-20T01:30:00Z",
    missedDate: "2026-10-20",
    daysAgo: 17,
    isOpen: false,
    ending: { how: "CAME_IN", at: "2026-10-22T01:12:00Z", closeReason: null, rebookedAt: null },
    entries: [entry(6, { date: "2026-10-21", method: "SMS", result: "REACHED", notes: "", closeReason: null })],
  }),
  item(23, {
    name: "Rhea Garcia",
    purok: "Purok 9",
    service: "Prenatal Checkup",
    missedAt: "2026-10-15T02:30:00Z",
    missedDate: "2026-10-15",
    daysAgo: 22,
    isOpen: false,
    ending: { how: "CLOSED", at: "2026-10-19T07:00:00Z", closeReason: "MOVED_AWAY", rebookedAt: null },
    entries: [
      entry(8, { date: "2026-10-19", method: "HOME_VISIT", result: "REACHED", notes: "Moved to her mother's house in Lipa. Will get checkups there.", closeReason: "MOVED_AWAY" }),
      entry(7, { date: "2026-10-16", method: "CALL", result: "NOT_REACHED", notes: "Number out of coverage.", closeReason: null }),
    ],
  }),
  item(24, {
    name: "Jenny Lim",
    purok: null,
    service: "Tetanus Toxoid Vaccination",
    missedAt: "2026-10-09T05:00:00Z",
    missedDate: "2026-10-09",
    daysAgo: 28,
    isOpen: false,
    ending: { how: "PREGNANCY_CLOSED", at: "2026-10-12T16:00:00Z", closeReason: null, rebookedAt: null },
  }),
];
