import Link from "next/link";
import { CaretLeftIcon, PhoneIcon, PregnancyIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlotClock } from "@/lib/appointments/format";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { findWalkInMothers, getVisitContext, listVisitServices } from "../queries/visits";
import type { VisitContext, VisitService, WalkInMother } from "../types";
import { VisitForm } from "./visit-form";

type Params = Record<string, string | string[] | undefined>;

// /staff/visits/new?appointment=ID | ?mother=ID | ?q=search. Reads the session:
// render inside <Suspense>.
export async function RecordVisitScreen({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole(AREA_ROLES.staff);
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return (Array.isArray(raw) ? raw[0] : raw) ?? "";
  };
  const id = (key: string) => (/^[1-9]\d{0,9}$/.test(value(key)) ? Number(value(key)) : undefined);
  const today = manilaTodayISO();
  const appointmentId = id("appointment");
  const motherId = id("mother");
  const q = value("q").slice(0, 60);

  const [{ t, locale }, context, services, results] = await Promise.all([
    getServerI18n(),
    appointmentId || motherId ? getVisitContext({ appointmentId, motherId }, today) : Promise.resolve(null),
    listVisitServices(),
    !appointmentId && !motherId && q ? findWalkInMothers(q, today) : Promise.resolve([]),
  ]);
  return <RecordVisitView t={t} locale={locale} context={context} services={services} q={q} results={results} searched={Boolean(q)} />;
}

// The page layout, without data loading (also used by the dev preview).
export function RecordVisitView({
  t,
  locale,
  context,
  services,
  q,
  results,
  searched,
}: {
  t: Dictionary;
  locale: Locale;
  context: VisitContext | null;
  services: VisitService[];
  q: string;
  results: WalkInMother[];
  searched: boolean;
}) {
  const f = t.visits.form;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/visits"
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {f.back}
      </Link>
      <h1 className="text-title font-extrabold">{f.title}</h1>

      {context ? (
        <>
          <section className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <IconCircle icon={PregnancyIcon} tone="blush" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold break-words">{context.mother.name}</p>
              <p className="tnum flex flex-wrap gap-x-3 text-sm text-ink-soft">
                {context.weeks !== null && <span className="font-semibold text-ink">{format(f.week, { weeks: context.weeks })}</span>}
                <span className="inline-flex items-center gap-1">
                  <PhoneIcon aria-hidden className="size-4" />
                  {context.mother.contactNumber}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {context.appointment
                  ? format(f.linkAppointment, { service: context.appointment.service, time: formatSlotClock(context.appointment.at, locale) })
                  : f.walkInNote}
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/staff/visits/new">{f.change}</Link>
            </Button>
          </section>
          <VisitForm context={context} services={services} />
        </>
      ) : (
        <section aria-labelledby="visit-find" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="visit-find" className="text-lg font-bold">
            {f.findTitle}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{f.findHint}</p>
          <form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="visit-q">{f.searchLabel}</Label>
              <InputIcon icon={UserIcon}>
                <Input id="visit-q" name="q" defaultValue={q} placeholder={f.searchPlaceholder} className="pl-11" />
              </InputIcon>
            </div>
            <Button type="submit" className="h-12">
              {f.search}
            </Button>
          </form>
          {searched &&
            (results.length === 0 ? (
              <p className="mt-4 text-ink-soft">{f.noMatches}</p>
            ) : (
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
                {results.map((result) => (
                  <li key={result.id}>
                    <Link href={`?mother=${result.id}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 no-underline hover:bg-milk">
                      <span className="font-semibold text-ink">{result.name}</span>
                      <span className="tnum text-sm text-ink-soft">
                        {result.contactNumber}
                        {result.weeks !== null && ` · ${format(t.visits.weekShort, { weeks: result.weeks })}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
        </section>
      )}
    </div>
  );
}
