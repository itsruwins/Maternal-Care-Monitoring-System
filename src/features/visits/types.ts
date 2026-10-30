import type { Dictionary } from "@/i18n/get-dictionary";
import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import type { AppointmentStatus } from "@/types/database";

export type VisitErrorKey = keyof Dictionary["visits"]["errors"];

export type VisitService = { id: number; name: string; icon: ServiceIconKey };

/** An appointment on today's list. */
export type TodayAppointment = {
  id: number;
  at: string;
  status: AppointmentStatus;
  service: string;
  mother: { id: number; name: string };
  /** Set once a visit is recorded for it. */
  visitId: number | null;
  /** Completed without a linked visit (the 6 PM check): her visit that day. */
  dayVisitId: number | null;
};

export type RecentVisit = {
  id: number;
  at: string;
  weeks: number;
  bp: string;
  weightKg: number;
  servicesCount: number;
  mother: { id: number; name: string };
};

/** Everything the visit form needs about her. */
export type VisitContext = {
  mother: { id: number; name: string; contactNumber: string };
  pregnancyId: number;
  weeks: number | null;
  lastWeightKg: number | null;
  /** Today's open appointment, linked to the visit. */
  appointment: { id: number; at: string; serviceId: number; service: string } | null;
};

export type WalkInMother = { id: number; name: string; contactNumber: string; weeks: number | null };

export type VisitServiceEntry = { serviceId: number; details: string; resultNotes: string };

export type VisitInput = {
  pregnancyId: number;
  appointmentId: number | null;
  bpSystolic: string;
  bpDiastolic: string;
  weightKg: string;
  temperatureC: string;
  pulseRate: string;
  fundalHeightCm: string;
  fetalHeartRate: string;
  notes: string;
  services: VisitServiceEntry[];
};

export type VisitField = Exclude<keyof VisitInput, "pregnancyId" | "appointmentId" | "services"> | "services";

export type RecordVisitResult =
  | { ok: true; visitId: number }
  | { ok: false; error?: VisitErrorKey; fieldErrors?: Partial<Record<VisitField, VisitErrorKey>> };

/** One service given at a visit, for display. */
export type GivenService = { serviceId: number; name: string; icon: ServiceIconKey; details: string; resultNotes: string | null };

export type VisitDetail = {
  id: number;
  at: string;
  weeks: number;
  pregnancyId: number;
  pregnancyActive: boolean;
  mother: { id: number; name: string };
  recordedBy: string | null;
  appointment: { service: string; at: string } | null;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    weightKg: number;
    temperatureC: number;
    pulseRate: number;
    fundalHeightCm: number | null;
    fetalHeartRate: number | null;
  };
  notes: string | null;
  services: GivenService[];
  /** The logged-in user may still change it (same day, or admin). */
  editable: boolean;
  /** Weight at her visit before this one (for the double-check note). */
  previousWeightKg: number | null;
};

/** A row on her record's Visits tab. */
export type MotherVisit = {
  id: number;
  at: string;
  weeks: number;
  bp: string;
  weightKg: number;
  services: string[];
  currentPregnancy: boolean;
};
