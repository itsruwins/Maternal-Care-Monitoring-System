import { SMS_LOG_PATH } from "@/features/sms/paths";
import type { DashboardCounts } from "./types";

/** Where each dashboard count opens. */
export const DASHBOARD_LINKS: Record<keyof DashboardCounts, string> = {
  today: "/staff/visits",
  requests: "/staff/appointments",
  followUps: "/staff/follow-ups",
  pregnant: "/staff/mothers?status=pregnant",
  dueSoon: "/staff/mothers?due=soon",
};

export const ACCOUNT_LINKS = {
  mothers: "/staff/mothers",
  mothersWithLogin: "/admin/accounts?role=MOTHER",
  healthWorkers: "/admin/accounts?role=HEALTH_WORKER",
  admins: "/admin/accounts?role=ADMIN",
  inactive: "/admin/accounts?status=INACTIVE",
} as const;

export const SMS_LINKS = {
  waiting: `${SMS_LOG_PATH}?status=waiting`,
  failed: `${SMS_LOG_PATH}?status=failed`,
} as const;

export const motherPregnancyHref = (motherId: number) => `/staff/mothers/${motherId}?tab=pregnancy`;
