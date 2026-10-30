import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeftIcon, CheckupIcon, InfoIcon, LockIcon, PencilIcon } from "@/components/icons";
import { ServiceArt } from "@/components/shared/service-art";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlotClock, formatSlotDate } from "@/lib/appointments/format";
import { AREA_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { getVisit, listVisitServices } from "../queries/visits";
import type { VisitDetail } from "../types";
import { VisitForm } from "./visit-form";

const visitIdOf = (raw: string) => (/^[1-9]\d{0,9}$/.test(raw) ? Number(raw) : null);

// /staff/visits/[visitId]: one visit (vitals, services, notes), with Edit on
// its day (or for admins). Reads the session: render inside <Suspense>.
export async function VisitDetailScreen({ params }: { params: Promise<{ visitId: string }> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const id = visitIdOf((await params).visitId);
  const visit = id ? await getVisit(id, { isAdmin: user.role === "ADMIN", today: manilaTodayISO() }) : null;
  if (!visit) notFound();
  const { t, locale } = await getServerI18n();
  return <VisitDetailView t={t} locale={locale} visit={visit} />;
}

// /staff/visits/[visitId]/edit: the visit form, filled in.
export async function EditVisitScreen({ params }: { params: Promise<{ visitId: string }> }) {
  const user = await requireRole(AREA_ROLES.staff);
  const id = visitIdOf((await params).visitId);
  const visit = id ? await getVisit(id, { isAdmin: user.role === "ADMIN", today: manilaTodayISO() }) : null;
  if (!visit) notFound();
  const [{ t, locale }, services] = await Promise.all([getServerI18n(), listVisitServices()]);
  const d = t.visits.detail;
  const text = (value: number | null) => (value === null ? "" : String(value));

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`/staff/visits/${visit.id}`} label={d.cancel} />
      <div>
        <h1 className="text-title font-extrabold">{d.editTitle}</h1>
        <p className="mt-2 text-ink-soft">
          {visit.mother.name} · {formatSlotDate(visit.at, locale)} · {format(d.week, { weeks: visit.weeks })}
        </p>
      </div>
      {visit.editable ? (
        <>
          <p className="flex items-start gap-2 text-sm text-ink-soft">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {d.editHint}
          </p>
          <VisitForm
            context={{
              mother: { id: visit.mother.id, name: visit.mother.name, contactNumber: "" },
              pregnancyId: visit.pregnancyId,
              weeks: visit.weeks,
              lastWeightKg: visit.previousWeightKg,
              appointment: null,
            }}
            services={services}
            edit={{
              visitId: visit.id,
              vitals: {
                bpSystolic: text(visit.vitals.bpSystolic),
                bpDiastolic: text(visit.vitals.bpDiastolic),
                weightKg: text(visit.vitals.weightKg),
                temperatureC: text(visit.vitals.temperatureC),
                pulseRate: text(visit.vitals.pulseRate),
                fundalHeightCm: text(visit.vitals.fundalHeightCm),
                fetalHeartRate: text(visit.vitals.fetalHeartRate),
              },
              entries: visit.services.map((s) => ({ serviceId: s.serviceId, details: s.details, resultNotes: s.resultNotes ?? "" })),
              notes: visit.notes ?? "",
            }}
          />
        </>
      ) : (
        <Locked text={d.locked} />
      )}
    </div>
  );
}

// The page layout, without data loading (also used by the dev preview).
export function VisitDetailView({ t, locale, visit }: { t: Dictionary; locale: Locale; visit: VisitDetail }) {
  const d = t.visits.detail;
  const v = visit.vitals;
  const unit = (value: number | string, label: string) => (
    <>
      {value}
      <span className="ml-1 text-sm font-medium text-ink-soft">{label}</span>
    </>
  );
  const vitals: [string, ReactNode][] = [
    [d.bp, unit(`${v.bpSystolic}/${v.bpDiastolic}`, "mmHg")],
    [d.weight, unit(v.weightKg, "kg")],
    [d.temperature, unit(v.temperatureC, "°C")],
    [d.pulse, unit(v.pulseRate, "/ min")],
    [d.fundal, v.fundalHeightCm === null ? null : unit(v.fundalHeightCm, "cm")],
    [d.fhr, v.fetalHeartRate === null ? null : unit(v.fetalHeartRate, "/ min")],
  ];

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/staff/visits" label={d.back} />

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:p-8">
        <IconCircle icon={CheckupIcon} tone="mint" size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title font-extrabold">{format(d.title, { date: formatSlotDate(visit.at, locale) })}</h1>
          <p className="mt-1 text-lg">
            <Link href={`/staff/mothers/${visit.mother.id}?tab=visits`} className="font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2">
              {visit.mother.name}
            </Link>
            <span className="text-ink-soft"> · {format(d.week, { weeks: visit.weeks })}</span>
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {visit.appointment ? format(d.fromAppointment, { service: visit.appointment.service }) : d.walkIn}
            {visit.recordedBy && <> · {format(d.recordedBy, { name: visit.recordedBy, time: formatSlotClock(visit.at, locale) })}</>}
          </p>
        </div>
        {visit.editable ? (
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href={`/staff/visits/${visit.id}/edit`}>
              <PencilIcon weight="bold" aria-hidden />
              {d.edit}
            </Link>
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
            <LockIcon aria-hidden className="size-4" />
            {d.locked}
          </span>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="visit-vitals" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 id="visit-vitals" className="mb-4 text-lg font-bold">
            {d.vitals}
          </h2>
          <dl className="grid grid-cols-2 gap-3">
            {vitals.map(([label, value]) => (
              <div key={label} className="rounded-md bg-milk px-4 py-3">
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className={value === null ? "mt-0.5 text-ink-soft" : "tnum mt-0.5 text-lg font-bold"}>{value ?? d.notRecorded}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="visit-services" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 id="visit-services" className="mb-4 text-lg font-bold">
              {d.services}
            </h2>
            {visit.services.length === 0 ? (
              <p className="text-ink-soft">{d.noServices}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {visit.services.map((service) => (
                  <li key={service.serviceId} className="flex items-start gap-3">
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
          <section aria-labelledby="visit-notes" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 id="visit-notes" className="mb-2 text-lg font-bold">
              {d.notes}
            </h2>
            <p className={visit.notes ? "break-words whitespace-pre-line" : "text-ink-soft"}>{visit.notes ?? d.noNotes}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2">
      <CaretLeftIcon weight="bold" aria-hidden className="size-4" />
      {label}
    </Link>
  );
}

function Locked({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2.5 rounded-2xl bg-white px-5 py-4 text-ink-soft shadow-[var(--shadow-soft)]">
      <LockIcon aria-hidden className="size-5 shrink-0" />
      {text}
    </p>
  );
}
