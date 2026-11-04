import {
  AccountsIcon,
  ActivityTypesIcon,
  AppointmentIcon,
  CallIcon,
  CheckupIcon,
  ClosedDayIcon,
  HomeIcon,
  LocationIcon,
  MothersIcon,
  ProfileIcon,
  RecordsIcon,
  ReportsIcon,
  SmsIcon,
  type Icon,
} from "@/components/icons";
import type { Dictionary } from "@/i18n/get-dictionary";

export type NavKey = keyof Dictionary["shell"]["nav"];

/** Counts shown at the end of sidebar items (a rose badge above zero). */
export type NavBadges = Partial<Record<NavKey, number>>;

export type NavItem = {
  key: NavKey;
  href: string;
  icon: Icon;
  /** Exact match only (home pages), so "/staff" isn't active on "/staff/mothers". */
  exact?: boolean;
};

// Staff app (health workers and admins). Pages for later phases show a
// "Coming in Phase N" card until they're built.
export const STAFF_NAV: NavItem[] = [
  { key: "home", href: "/staff", icon: HomeIcon, exact: true },
  { key: "mothers", href: "/staff/mothers", icon: MothersIcon },
  { key: "appointments", href: "/staff/appointments", icon: AppointmentIcon },
  { key: "visits", href: "/staff/visits", icon: CheckupIcon },
  { key: "followUps", href: "/staff/follow-ups", icon: CallIcon },
  { key: "reports", href: "/staff/reports", icon: ReportsIcon },
];

// Extra group shown to admins in the same sidebar.
export const ADMIN_NAV: NavItem[] = [
  { key: "accounts", href: "/admin/accounts", icon: AccountsIcon },
  { key: "activityTypes", href: "/admin/activity-types", icon: ActivityTypesIcon },
  { key: "puroks", href: "/admin/puroks", icon: LocationIcon },
  { key: "closedDays", href: "/admin/closed-days", icon: ClosedDayIcon },
  { key: "smsLog", href: "/admin/sms", icon: SmsIcon },
];

// Mother portal: floating bottom navigation on every screen size.
export const MOTHER_NAV: NavItem[] = [
  { key: "home", href: "/mother", icon: HomeIcon, exact: true },
  { key: "appointments", href: "/mother/appointments", icon: AppointmentIcon },
  { key: "visits", href: "/mother/visits", icon: RecordsIcon },
  { key: "profile", href: "/mother/profile", icon: ProfileIcon },
];

export const STAFF_PROFILE_HREF = "/staff/profile";

export function isActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}
