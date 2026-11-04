import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CallIcon,
  CaretLeftIcon,
  CaretRightIcon,
  UserIcon,
} from "@/components/icons";
import { ScrollActiveIntoView } from "@/components/shared/scroll-active-into-view";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { MotherAppointmentsPanel } from "@/features/appointments/components/mother-appointments-panel";
import { MotherFollowUpsPanel } from "@/features/follow-ups/components/mother-follow-ups-panel";
import { MotherSmsPanel } from "@/features/sms/components/mother-sms-panel";
import { countOpenFollowUps } from "@/features/follow-ups/queries/follow-ups";
import { MotherVisitsPanel } from "@/features/visits/components/mother-visits-panel";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getShownPuroks } from "@/lib/puroks/shown-puroks";
import type { PurokOption } from "@/lib/puroks/types";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { daysBetween, formatDate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { summarizeRecords } from "../pregnancy-summary";
import { getMother } from "../queries/get-mother";
import { getMotherActivity } from "../queries/get-mother-activity";
import type { MotherActivity, MotherRecord } from "../types";
import { MotherDetailsCard } from "./mother-details-card";
import { MotherDetailsView } from "./mother-details-view";
import { MotherLoginCard } from "./mother-login-card";
import { PregnancyTab } from "./pregnancy-tab";
import { RecentActivity } from "./recent-activity";
import { RecordHeader } from "./record-header";

export const RECORD_TABS = [
  "overview",
  "pregnancy",
  "appointments",
  "visits",
  "followUps",
  "sms",
] as const;
export type RecordTab = (typeof RECORD_TABS)[number];

// /staff/mothers/[motherId]?tab=…: one mother's record. Reads the session:
// render inside <Suspense>.
export async function MotherRecordScreen({
  params,
  searchParams,
}: {
  params: Promise<{ motherId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole(AREA_ROLES.staff);
  const [{ motherId }, query] = await Promise.all([params, searchParams]);
  const id = /^[1-9]\d{0,9}$/.test(motherId) ? Number(motherId) : null;
  const mother = id ? await getMother(id) : null;
  if (!mother) notFound();

  const tabParam = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const tab = RECORD_TABS.includes(tabParam as RecordTab)
    ? (tabParam as RecordTab)
    : "overview";
  const [{ t, locale }, puroks, openFollowUps, activity] = await Promise.all([
    getServerI18n(),
    getShownPuroks(),
    countOpenFollowUps(mother.id),
    getMotherActivity(
      [...(mother.current ? [mother.current.id] : []), ...mother.past.map((p) => p.id)],
      new Date().toISOString(),
    ),
  ]);
  return (
    <MotherRecordView
      t={t}
      locale={locale}
      mother={mother}
      tab={tab}
      puroks={puroks}
      today={manilaTodayISO()}
      openFollowUps={openFollowUps}
      activity={activity}
      appointments={
        tab === "appointments" ? (
          <MotherAppointmentsPanel
            motherId={mother.id}
            canBook={Boolean(mother.current)}
            isAdmin={user.role === "ADMIN"}
          />
        ) : null
      }
      visits={
        tab === "visits" ? (
          <MotherVisitsPanel
            motherId={mother.id}
            canRecord={Boolean(mother.current)}
          />
        ) : null
      }
      followUps={
        tab === "followUps" ? (
          <MotherFollowUpsPanel
            motherId={mother.id}
            isAdmin={user.role === "ADMIN"}
          />
        ) : null
      }
      sms={
        tab === "sms" ? (
          <MotherSmsPanel motherId={mother.id} isAdmin={user.role === "ADMIN"} />
        ) : null
      }
    />
  );
}

// The page layout, without data loading (also used by the dev preview).
export function MotherRecordView({
  t,
  locale,
  mother,
  tab,
  puroks,
  today,
  openFollowUps = 0,
  activity,
  appointments,
  visits,
  followUps,
  sms,
}: {
  t: Dictionary;
  locale: Locale;
  mother: MotherRecord;
  tab: RecordTab;
  puroks: PurokOption[];
  today: string;
  /** Her missed visits still to follow up (the count on the tab). */
  openFollowUps?: number;
  /** Next and last visit, and her latest events. */
  activity: MotherActivity;
  /** The Appointments tab's content (from the appointments feature). */
  appointments?: ReactNode;
  /** The Visits tab's content (from the visits feature). */
  visits?: ReactNode;
  /** The Follow-ups tab's content (from the follow-ups feature). */
  followUps?: ReactNode;
  /** The SMS log tab's content (from the sms feature). */
  sms?: ReactNode;
}) {
  const r = t.mothers.record;
  const name = [mother.firstName, mother.middleName, mother.lastName]
    .filter(Boolean)
    .join(" ");
  const ageDays = daysBetween(mother.dateOfBirth, today);
  const age = ageDays !== null ? Math.floor(ageDays / 365.25) : null;
  const registered = formatDate(mother.registrationDate, locale);
  const origin = mother.registeredBy
    ? format(r.registeredBy, { name: mother.registeredBy, date: registered })
    : mother.selfSignup
      ? format(r.selfSignup, { date: registered })
      : format(r.registeredOn, { date: registered });
  const pregnancy = summarizeRecords(
    [...(mother.current ? [mother.current] : []), ...mother.past],
    today,
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/mothers"
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {r.back}
      </Link>

      <RecordHeader
        t={t}
        locale={locale}
        mother={mother}
        name={name}
        age={age}
        origin={origin}
        pregnancy={pregnancy}
        activity={activity}
        today={today}
      />

      {/* Tabs: plain links, so each tab has its own address. */}
      <nav aria-label={r.tabsLabel}>
        <ScrollActiveIntoView className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-1 rounded-full bg-white p-1.5 shadow-[var(--shadow-soft)]">
            {RECORD_TABS.map((key) => {
              const active = key === tab;
              return (
                <li key={key}>
                  <Link
                    href={key === "overview" ? "?" : `?tab=${key}`}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors",
                      active
                        ? "bg-mint font-semibold text-leaf"
                        : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                    )}
                  >
                    {r.tabs[key]}
                    {key === "followUps" && openFollowUps > 0 && (
                      <span className="tnum grid h-6 min-w-6 place-items-center rounded-full bg-rose-deep px-1.5 text-caption font-bold text-white">
                        {openFollowUps}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollActiveIntoView>
      </nav>

      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          {openFollowUps > 0 && <FollowUpNotice t={t} count={openFollowUps} />}
          {/* Wide screens: details over login on the left, activity on the right. */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
            <div className="lg:col-start-1 lg:row-start-1">
              <MotherDetailsCard mother={mother} puroks={puroks} today={today}>
                <MotherDetailsView t={t} locale={locale} mother={mother} name={name} age={age} origin={origin} />
              </MotherDetailsCard>
            </div>
            <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <RecentActivity t={t} locale={locale} events={activity.events} />
            </div>
            <section
              aria-labelledby="her-login"
              className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8 lg:col-start-1 lg:row-start-2"
            >
              <div className="mb-5 flex items-center gap-3">
                <IconCircle icon={UserIcon} tone="mint" size="sm" />
                <h2 id="her-login" className="text-xl font-bold">
                  {r.login.title}
                </h2>
              </div>
              <MotherLoginCard motherId={mother.id} login={mother.login} />
            </section>
          </div>
        </div>
      )}

      {tab === "pregnancy" && (
        <PregnancyTab t={t} locale={locale} mother={mother} today={today} />
      )}

      {tab === "appointments" && appointments}

      {tab === "visits" && visits}

      {tab === "followUps" && followUps}

      {tab === "sms" && sms}
    </div>
  );
}

/** Above the Overview while missed visits wait for a follow-up: blush, with the way to the Follow-ups tab. */
function FollowUpNotice({ t, count }: { t: Dictionary; count: number }) {
  const n = t.mothers.record.followUpNotice;
  return (
    <section
      aria-labelledby="follow-up-notice"
      className="flex flex-col gap-4 rounded-2xl bg-blush/70 p-5 sm:flex-row sm:items-center sm:gap-5 sm:px-6"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <IconCircle icon={CallIcon} tone="white" size="sm" className="text-rose-deep" />
        <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
          <h2 id="follow-up-notice" className="font-bold text-rose-deep">
            {count === 1 ? n.one : format(n.other, { count })}
          </h2>
          <p className="text-[0.95rem] text-ink-soft">{n.body}</p>
        </div>
      </div>
      <Button asChild variant="secondary" size="sm" className="self-start sm:self-auto">
        <Link href="?tab=followUps" scroll={false} className="no-underline">
          {n.open}
          <CaretRightIcon weight="bold" aria-hidden className="size-4" />
        </Link>
      </Button>
    </section>
  );
}
