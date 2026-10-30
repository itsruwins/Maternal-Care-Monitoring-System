import Link from "next/link";
import { CaretRightIcon, CheckupIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { formatSlot } from "@/lib/appointments/format";
import { listMotherVisits } from "../queries/visits";
import type { MotherVisit } from "../types";

// The Visits tab on a mother's record: Record visit (with a current
// pregnancy), then her visits newest first, each opening its details. Loads
// its own data (the page has already checked the staff role).
export async function MotherVisitsPanel({ motherId, canRecord }: { motherId: number; canRecord: boolean }) {
  const [{ t, locale }, visits] = await Promise.all([getServerI18n(), listMotherVisits(motherId)]);
  return <MotherVisitsPanelView t={t} locale={locale} motherId={motherId} canRecord={canRecord} visits={visits} />;
}

export function MotherVisitsPanelView({
  t,
  locale,
  motherId,
  canRecord,
  visits,
}: {
  t: Dictionary;
  locale: Locale;
  motherId: number;
  canRecord: boolean;
  visits: MotherVisit[];
}) {
  const d = t.visits.detail;
  const current = visits.filter((v) => v.currentPregnancy);
  const earlier = visits.filter((v) => !v.currentPregnancy);
  const list = (items: MotherVisit[]) => (
    <ul className="divide-y divide-line rounded-3xl bg-white px-5 shadow-[var(--shadow-soft)] sm:px-6">
      {items.map((visit) => (
        <li key={visit.id}>
          <Link href={`/staff/visits/${visit.id}`} className="flex items-center gap-4 py-4 no-underline">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{formatSlot(visit.at, locale, "short")}</span>
              <span className="tnum mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                <span className="font-semibold text-ink">{format(t.visits.weekShort, { weeks: visit.weeks })}</span>
                <span>BP {visit.bp}</span>
                <span>{visit.weightKg} kg</span>
              </span>
              {visit.services.length > 0 && <span className="mt-1 block text-sm break-words text-ink-soft">{visit.services.join(" · ")}</span>}
            </span>
            <CaretRightIcon weight="bold" aria-hidden className="size-5 shrink-0 text-ink-soft" />
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      {canRecord && (
        <div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/staff/visits/new?mother=${motherId}`}>
              <CheckupIcon weight="bold" aria-hidden />
              {d.tabRecord}
            </Link>
          </Button>
        </div>
      )}
      {visits.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{d.tabEmpty}</p>
      ) : (
        <>
          {current.length > 0 && (
            <section aria-labelledby="visits-current" className="flex flex-col gap-3">
              <h2 id="visits-current" className="text-lg font-bold">
                {d.thisPregnancy}
              </h2>
              {list(current)}
            </section>
          )}
          {earlier.length > 0 && (
            <section aria-labelledby="visits-earlier" className="flex flex-col gap-3">
              <h2 id="visits-earlier" className="text-lg font-bold">
                {d.earlier}
              </h2>
              {list(earlier)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
