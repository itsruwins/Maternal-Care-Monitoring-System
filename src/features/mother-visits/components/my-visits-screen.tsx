import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentIcon, CaretLeftIcon, CaretRightIcon, InfoIcon, PlusIcon, PregnancyIcon, WellbeingIcon, type Icon } from "@/components/icons";
import { ServiceArt } from "@/components/shared/service-art";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatMonthDay, formatSlot, formatSlotDate } from "@/lib/appointments/format";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";
import { VisitDateTile } from "@/features/mother-appointments/components/visit-status";
import { getMyVisit, getMyVisits } from "../queries/my-visits";
import type { MyVisitDetail, MyVisitRow, MyVisits } from "../types";
import { NumbersSummary, weightChange } from "./numbers-summary";

// /mother/visits: her next visit, her latest weight and blood pressure for
// this pregnancy (with what changed), and her visits. Reads the session: render inside <Suspense>.
export async function MyVisitsScreen() {
  const user = await requireRole(AREA_ROLES.mother);
  const [{ t, locale }, data] = await Promise.all([getServerI18n(), getMyVisits(user)]);
  return <MyVisitsView t={t} locale={locale} data={data} />;
}

// /mother/visits/[visitId]: what was measured and given at one visit.
export async function MyVisitDetailScreen({ params }: { params: Promise<{ visitId: string }> }) {
  const user = await requireRole(AREA_ROLES.mother);
  const raw = (await params).visitId;
  const visit = /^[1-9]\d{0,9}$/.test(raw) ? await getMyVisit(user, Number(raw)) : null;
  if (!visit) notFound();
  const { t, locale } = await getServerI18n();
  return <MyVisitDetailView t={t} locale={locale} visit={visit} />;
}

// The page layouts, without data loading (also used by the dev previews).
export function MyVisitsView({ t, locale, data }: { t: Dictionary; locale: Locale; data: MyVisits }) {
  const m = t.myVisits;
  const current = data.visits.filter((v) => v.currentPregnancy);
  const earlier = data.visits.filter((v) => !v.currentPregnancy);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-title font-extrabold">{m.title}</h1>
        <p className="mt-2 max-w-[56ch] text-ink-soft">{m.intro}</p>
      </div>

      {/* Next visit */}
      <section aria-labelledby="next-visit" className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <IconCircle icon={AppointmentIcon} tone="leaf" />
        <div className="min-w-0 flex-1">
          <h2 id="next-visit" className="text-sm font-semibold text-ink-soft">
            {m.next}
          </h2>
          {data.next ? (
            <>
              <p className="tnum text-lg font-bold">{formatSlot(data.next.at, locale)}</p>
              <p className="text-sm text-ink-soft">
                {data.next.service}
                {data.next.status !== "CONFIRMED" && ` · ${t.myAppointments.statuses[data.next.status]}`}
              </p>
            </>
          ) : (
            <p className="text-lg font-bold">{m.nextNone}</p>
          )}
        </div>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href={data.next || !data.hasCurrentPregnancy ? "/mother/appointments" : "/mother/appointments/new"}>
            {!data.next && data.hasCurrentPregnancy && <PlusIcon weight="bold" aria-hidden />}
            {data.next || !data.hasCurrentPregnancy ? m.seeAppointments : m.book}
          </Link>
        </Button>
      </section>

      {/* Her numbers (this pregnancy) */}
      {current.length > 0 && (
        <section aria-labelledby="my-numbers" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="my-numbers" className="text-lg font-bold">
            {m.charts}
          </h2>
          <p className="mt-1 flex items-start gap-2 text-sm text-ink-soft">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {m.chartsNote}
          </p>
          <NumbersSummary t={t} locale={locale} visits={current} />
        </section>
      )}

      {/* History */}
      <section aria-labelledby="my-visit-history" className="flex flex-col gap-3">
        <h2 id="my-visit-history" className="text-lg font-bold">
          {m.history}
        </h2>
        {data.visits.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{m.empty}</p>
        ) : (
          <>
            {current.length > 0 && <VisitList t={t} locale={locale} title={earlier.length ? m.thisPregnancy : null} visits={current} />}
            {earlier.length > 0 && <VisitList t={t} locale={locale} title={m.earlier} visits={earlier} />}
          </>
        )}
      </section>
    </div>
  );
}

function VisitList({ t, locale, title, visits }: { t: Dictionary; locale: Locale; title: string | null; visits: MyVisitRow[] }) {
  const m = t.myVisits;
  return (
    <div className="flex flex-col gap-2">
      {title && <h3 className="text-sm font-semibold text-ink-soft">{title}</h3>}
      <ul className="divide-y divide-line rounded-3xl bg-white px-5 py-1 shadow-[var(--shadow-soft)] sm:px-6 sm:py-2">
        {visits.map((visit) => (
          <li key={visit.id}>
            <Link href={`/mother/visits/${visit.id}`} className="flex items-center gap-4 py-4 no-underline">
              {/* The date is read out from the text beside it. */}
              <div aria-hidden className="self-start sm:self-center">
                <VisitDateTile iso={visit.at} locale={locale} status="COMPLETED" />
              </div>
              <span className="flex min-w-0 flex-1 flex-col gap-x-4 gap-y-2 sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{formatSlotDate(visit.at, locale)}</span>
                  <span className="mt-0.5 block text-sm break-words text-ink-soft">
                    {[format(m.week, { weeks: visit.weeks }), ...visit.services].join(" · ")}
                  </span>
                </span>
                <span className="tnum flex shrink-0 flex-wrap gap-2 text-sm">
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-milk px-3">
                    <abbr title={m.bp} className="text-ink-soft no-underline">
                      {m.bpShort}
                    </abbr>
                    <span className="font-bold text-ink">
                      {visit.bpSystolic}/{visit.bpDiastolic}
                    </span>
                  </span>
                  <span className="inline-flex h-8 items-center gap-1 rounded-full bg-milk px-3">
                    <span className="sr-only">{m.weight}</span>
                    <span className="font-bold text-ink">{visit.weightKg}</span>
                    <span className="text-ink-soft">kg</span>
                  </span>
                </span>
              </span>
              <CaretRightIcon weight="bold" aria-hidden className="size-5 shrink-0 text-ink-soft" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MyVisitDetailView({ t, locale, visit }: { t: Dictionary; locale: Locale; visit: MyVisitDetail }) {
  const m = t.myVisits;
  const d = m.detail;
  const v = visit.vitals;
  const notes = visit.services.filter((service) => service.resultNotes);
  const prev = visit.previous;
  const prevDate = prev ? formatMonthDay(prev.at, locale) : "";
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/mother/visits"
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {d.back}
      </Link>

      {/* Date tile and title on the left; what she received on the right from 1024px (under the title below). */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 items-center gap-4">
          {/* The date is in the title. */}
          <div aria-hidden>
            <VisitDateTile iso={visit.at} locale={locale} status="COMPLETED" />
          </div>
          <div className="min-w-0">
            <h1 className="text-title font-extrabold">{format(d.title, { date: formatSlotDate(visit.at, locale) })}</h1>
            <p className="mt-1 text-ink-soft">{format(d.week, { weeks: visit.weeks })}</p>
          </div>
        </div>

        {visit.services.length > 0 && (
          <section aria-labelledby="my-services" className="lg:max-w-md lg:shrink-0">
            <h2 id="my-services" className="sr-only">
              {d.services}
            </h2>
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {visit.services.map((service, i) => (
                <li key={i} className="inline-flex max-w-full items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-1.5 shadow-[var(--shadow-soft)]">
                  <ServiceArt icon={service.icon} size="sm" className="size-9" />
                  <span className="min-w-0 font-semibold break-words">
                    {service.name}
                    {service.details && <span className="font-normal text-ink-soft"> · {service.details}</span>}
                  </span>
                </li>
              ))}
            </ul>
            {notes.length > 0 && (
              <ul className="mt-2 flex flex-col gap-0.5 text-sm text-ink-soft lg:text-right">
                {notes.map((service, i) => (
                  <li key={i} className="break-words">
                    <span className="font-medium text-ink">{service.name}:</span> {service.resultNotes}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* Her measurements in two panels: hers (mint) and her baby's (blush), top-aligned, each as tall as its tiles. */}
      <div className="grid items-start gap-4 md:grid-cols-2">
        <VitalPanel
          id="my-vitals-you"
          icon={WellbeingIcon}
          tone="you"
          title={d.you}
          notRecorded={d.notRecorded}
          rows={[
            {
              label: m.bp,
              explain: d.explain.bp,
              value: `${v.bpSystolic}/${v.bpDiastolic}`,
              unit: "mmHg",
              change: prev ? [null, format(m.bpBefore, { date: prevDate, bp: `${prev.bpSystolic}/${prev.bpDiastolic}` })] : null,
            },
            {
              label: m.weight,
              explain: d.explain.weight,
              value: String(v.weightKg),
              unit: "kg",
              change: prev ? weightChange(t, v.weightKg, prev.weightKg, prevDate) : null,
            },
            { label: d.temperature, explain: d.explain.temperature, value: String(v.temperatureC), unit: "°C" },
            { label: d.pulse, explain: d.explain.pulse, value: String(v.pulseRate), unit: "/ min" },
          ]}
        />
        <VitalPanel
          id="my-vitals-baby"
          icon={PregnancyIcon}
          tone="baby"
          title={d.baby}
          notRecorded={d.notRecorded}
          rows={[
            { label: d.fundal, explain: d.explain.fundal, value: v.fundalHeightCm === null ? null : String(v.fundalHeightCm), unit: "cm" },
            { label: d.fhr, explain: d.explain.fhr, value: v.fetalHeartRate === null ? null : String(v.fetalHeartRate), unit: "/ min" },
          ]}
        />
      </div>
    </div>
  );
}

type VitalRow = { label: string; explain: string; value: string | null; unit: string; change?: [Icon | null, string] | null };

// One panel of measurements ("You" in mint, "Your baby" in blush): an icon
// circle and title, then a white tile per measurement with what it is in one
// plain line, the value on the right and, for weight and blood pressure, what
// changed since her visit before (neutral words, no good or bad colours).
function VitalPanel({
  id,
  icon: PanelIcon,
  tone,
  title,
  notRecorded,
  rows,
}: {
  id: string;
  icon: Icon;
  tone: "you" | "baby";
  title: string;
  notRecorded: string;
  rows: VitalRow[];
}) {
  return (
    <section aria-labelledby={id} className={cn("rounded-3xl p-5 sm:p-7", tone === "you" ? "bg-mint" : "bg-blush")}>
      <div className="flex items-center gap-3">
        <IconCircle icon={PanelIcon} tone="white" className={tone === "baby" ? "text-rose-deep" : undefined} />
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
      </div>
      <dl className="mt-5 flex flex-col gap-3">
        {rows.map((row) => {
          const ChangeIcon = row.change?.[0];
          return (
            <div key={row.label} className="flex items-start justify-between gap-4 rounded-md bg-white p-4">
              <dt className="min-w-0">
                <span className="block font-semibold break-words">{row.label}</span>
                <span className="mt-0.5 block text-sm text-ink-soft">{row.explain}</span>
                {row.change && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-milk px-2.5 py-1 text-sm font-semibold text-ink">
                    {ChangeIcon && <ChangeIcon weight="bold" aria-hidden className="size-3.5 shrink-0 text-leaf" />}
                    {row.change[1]}
                  </span>
                )}
              </dt>
              <dd className={row.value === null ? "shrink-0 text-sm text-ink-soft" : "tnum shrink-0 text-right text-xl leading-7 font-extrabold whitespace-nowrap"}>
                {row.value === null ? (
                  notRecorded
                ) : (
                  <>
                    {row.value}
                    <span className="ml-1 text-sm font-medium text-ink-soft">{row.unit}</span>
                  </>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
