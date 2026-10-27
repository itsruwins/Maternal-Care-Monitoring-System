import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeftIcon, ComingSoonIcon, LocationIcon, PhoneIcon, PregnancyIcon, UserIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { StatusBadge } from "@/features/accounts/components/badges";
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
import type { MotherRecord } from "../types";
import { MotherDetailsForm } from "./mother-details-form";
import { MotherLoginCard } from "./mother-login-card";
import { PregnancyChip } from "./pregnancy-chip";
import { PregnancyTab } from "./pregnancy-tab";

export const RECORD_TABS = ["overview", "pregnancy", "appointments", "visits", "followUps", "sms"] as const;
export type RecordTab = (typeof RECORD_TABS)[number];
// Tabs whose content comes in a later phase.
const LATER: Partial<Record<RecordTab, number>> = { appointments: 4, visits: 5, followUps: 6, sms: 7 };

// /staff/mothers/[motherId]?tab=…: one mother's record. Reads the session:
// render inside <Suspense>.
export async function MotherRecordScreen({
  params,
  searchParams,
}: {
  params: Promise<{ motherId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(AREA_ROLES.staff);
  const [{ motherId }, query] = await Promise.all([params, searchParams]);
  const id = /^[1-9]\d{0,9}$/.test(motherId) ? Number(motherId) : null;
  const mother = id ? await getMother(id) : null;
  if (!mother) notFound();

  const tabParam = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const tab = RECORD_TABS.includes(tabParam as RecordTab) ? (tabParam as RecordTab) : "overview";
  const [{ t, locale }, puroks] = await Promise.all([getServerI18n(), getShownPuroks()]);
  return <MotherRecordView t={t} locale={locale} mother={mother} tab={tab} puroks={puroks} today={manilaTodayISO()} />;
}

// The page layout, without data loading (also used by the dev preview).
export function MotherRecordView({
  t,
  locale,
  mother,
  tab,
  puroks,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  mother: MotherRecord;
  tab: RecordTab;
  puroks: PurokOption[];
  today: string;
}) {
  const r = t.mothers.record;
  const name = [mother.firstName, mother.middleName, mother.lastName].filter(Boolean).join(" ");
  const ageDays = daysBetween(mother.dateOfBirth, today);
  const age = ageDays !== null ? Math.floor(ageDays / 365.25) : null;
  const registered = formatDate(mother.registrationDate, locale);
  const origin = mother.registeredBy
    ? format(r.registeredBy, { name: mother.registeredBy, date: registered })
    : mother.selfSignup
      ? format(r.selfSignup, { date: registered })
      : format(r.registeredOn, { date: registered });
  const pregnancy = summarizeRecords([...(mother.current ? [mother.current] : []), ...mother.past], today);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/mothers"
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {r.back}
      </Link>

      {/* Who she is */}
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:p-8">
        <IconCircle icon={PregnancyIcon} tone="blush" size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-title font-extrabold break-words">{name}</h1>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.95rem] text-ink-soft">
            {age !== null && <span>{format(r.age, { age })}</span>}
            <span className="tnum inline-flex items-center gap-1.5">
              <PhoneIcon aria-hidden className="size-4" />
              {mother.contactNumber}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LocationIcon aria-hidden className="size-4" />
              {mother.purokName ?? t.mothers.noPurokYet}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <PregnancyChip t={t} locale={locale} pregnancy={pregnancy} />
            {mother.login && (
              <StatusBadge
                status={mother.login.status}
                label={`${t.mothers.columns.login}: ${mother.login.status === "ACTIVE" ? r.login.active : r.login.inactive}`}
              />
            )}
          </div>
          <p className="text-sm text-ink-soft">{origin}</p>
        </div>
      </section>

      {/* Tabs: plain links, so each tab has its own address. */}
      <nav aria-label={r.tabsLabel} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
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
                    "flex h-10 items-center rounded-full px-4 text-[0.95rem] whitespace-nowrap no-underline transition-colors",
                    active ? "bg-mint font-semibold text-leaf" : "font-medium text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {r.tabs[key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <section aria-labelledby="her-details" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <IconCircle icon={UserIcon} tone="blush" size="sm" />
              <h2 id="her-details" className="text-xl font-bold">{r.details.title}</h2>
            </div>
            <MotherDetailsForm key={mother.id} mother={mother} puroks={puroks} today={today} />
          </section>
          <section aria-labelledby="her-login" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <IconCircle icon={UserIcon} tone="mint" size="sm" />
              <h2 id="her-login" className="text-xl font-bold">{r.login.title}</h2>
            </div>
            <MotherLoginCard motherId={mother.id} login={mother.login} />
          </section>
        </div>
      )}

      {tab === "pregnancy" && <PregnancyTab t={t} locale={locale} mother={mother} today={today} />}

      {LATER[tab] && (
        <section className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)]">
          <IconCircle icon={ComingSoonIcon} tone="beige" size="lg" />
          <p className="max-w-[40ch] text-ink-soft">{format(r.comingSoon, { tab: r.tabs[tab], phase: LATER[tab]! })}</p>
        </section>
      )}
    </div>
  );
}

