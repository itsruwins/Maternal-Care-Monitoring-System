import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentIcon, CaretLeftIcon, CaretRightIcon, CheckupIcon, InfoIcon, PlusIcon } from "@/components/icons";
import { ServiceArt } from "@/components/shared/service-art";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot, formatSlotDate } from "@/lib/appointments/format";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { getMyVisit, getMyVisits } from "../queries/my-visits";
import type { MyVisitDetail, MyVisitRow, MyVisits } from "../types";
import { ChartPair } from "./chart-pair";

// /mother/visits: her next visit, weight and blood pressure charts for this
// pregnancy, and her visits. Reads the session: render inside <Suspense>.
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
  const chartPoints = [...current].reverse();

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

      {/* Charts (this pregnancy) */}
      {chartPoints.length > 0 && (
        <section aria-labelledby="my-numbers" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="my-numbers" className="text-lg font-bold">
            {m.charts}
          </h2>
          <p className="mt-1 flex items-start gap-2 text-sm text-ink-soft">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {m.chartsNote}
          </p>
          {chartPoints.length < 2 ? (
            <p className="mt-5 rounded-md bg-milk px-4 py-3 text-ink-soft">{m.needTwo}</p>
          ) : (
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <ChartPair
                points={chartPoints.map((v) => ({ week: v.weeks, at: v.at, weight: v.weightKg, top: v.bpSystolic, bottom: v.bpDiastolic }))}
              />
            </div>
          )}
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
      <ul className="divide-y divide-line rounded-3xl bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
        {visits.map((visit) => (
          <li key={visit.id}>
            <Link href={`/mother/visits/${visit.id}`} className="flex items-center gap-4 py-4 no-underline">
              <span className="tnum grid size-14 shrink-0 place-items-center rounded-md bg-blush text-center text-sm leading-tight font-bold whitespace-pre-line text-rose-deep">
                {format(m.week, { weeks: visit.weeks }).replace(" ", "\n")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{formatSlotDate(visit.at, locale)}</span>
                <span className="tnum mt-0.5 flex flex-wrap gap-x-4 text-sm text-ink-soft">
                  <span>
                    {m.bp} {visit.bpSystolic}/{visit.bpDiastolic}
                  </span>
                  <span>
                    {m.weight} {visit.weightKg} kg
                  </span>
                </span>
                {visit.services.length > 0 && <span className="mt-1 block text-sm break-words text-ink-soft">{visit.services.join(" · ")}</span>}
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
  const tiles: [string, string | null, string][] = [
    [m.bp, `${v.bpSystolic}/${v.bpDiastolic}`, "mmHg"],
    [m.weight, String(v.weightKg), "kg"],
    [d.temperature, String(v.temperatureC), "°C"],
    [d.pulse, String(v.pulseRate), "/ min"],
    [d.fundal, v.fundalHeightCm === null ? null : String(v.fundalHeightCm), "cm"],
    [d.fhr, v.fetalHeartRate === null ? null : String(v.fetalHeartRate), "/ min"],
  ];
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/mother/visits"
        className="-my-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
        {d.back}
      </Link>
      <div className="flex items-center gap-4">
        <IconCircle icon={CheckupIcon} tone="blush" size="lg" />
        <div>
          <h1 className="text-title font-extrabold">{format(d.title, { date: formatSlotDate(visit.at, locale) })}</h1>
          <p className="mt-1 text-ink-soft">{format(d.week, { weeks: visit.weeks })}</p>
        </div>
      </div>
      <section aria-labelledby="my-vitals" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <h2 id="my-vitals" className="mb-4 text-lg font-bold">
          {d.vitals}
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map(([label, value, unit]) => (
            <div key={label} className="rounded-md bg-milk px-4 py-3">
              <dt className="text-sm text-ink-soft">{label}</dt>
              <dd className={value === null ? "mt-0.5 text-ink-soft" : "tnum mt-0.5 text-lg font-bold"}>
                {value === null ? (
                  d.notRecorded
                ) : (
                  <>
                    {value}
                    <span className="ml-1 text-sm font-medium text-ink-soft">{unit}</span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="my-services" className="rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
        <h2 id="my-services" className="mb-4 text-lg font-bold">
          {d.services}
        </h2>
        {visit.services.length === 0 ? (
          <p className="text-ink-soft">{d.noServices}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visit.services.map((service, i) => (
              <li key={i} className="flex items-start gap-3">
                <ServiceArt icon={service.icon} size="sm" className="size-10" />
                <div className="min-w-0">
                  <p className="font-semibold break-words">{service.name}</p>
                  {service.details && <p className="break-words">{service.details}</p>}
                  {service.resultNotes && <p className="text-sm break-words text-ink-soft">{service.resultNotes}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
