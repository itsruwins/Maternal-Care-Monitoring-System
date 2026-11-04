import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import type { AppointmentStatus } from "@/types/database";

export type MyVisitRow = {
  id: number;
  at: string;
  weeks: number;
  bpSystolic: number;
  bpDiastolic: number;
  weightKg: number;
  services: string[];
  currentPregnancy: boolean;
};

export type MyVisits = {
  hasCurrentPregnancy: boolean;
  next: { at: string; service: string; status: AppointmentStatus } | null;
  visits: MyVisitRow[];
};

export type MyVisitDetail = {
  id: number;
  at: string;
  weeks: number;
  vitals: {
    bpSystolic: number;
    bpDiastolic: number;
    weightKg: number;
    temperatureC: number;
    pulseRate: number;
    fundalHeightCm: number | null;
    fetalHeartRate: number | null;
  };
  services: { name: string; icon: ServiceIconKey; details: string; resultNotes: string | null }[];
  /** Her visit before this one in the same pregnancy (null for the first). */
  previous: { at: string; bpSystolic: number; bpDiastolic: number; weightKg: number } | null;
};
