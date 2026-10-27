import { ClosedDayIcon, DangerIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getServerI18n } from "@/i18n/server";
import { requireRole } from "@/lib/auth/session";
import { manilaTodayISO } from "@/lib/utils/manila-date";
import { parseISODate } from "@/lib/utils/pregnancy";
import { listClosedDays } from "../queries/list-closed-days";
import type { ClosedDay } from "../types";
import { ClosedDayDialog } from "./closed-day-dialog";
import { RemoveClosedDayButton } from "./remove-closed-day-button";

// /admin/closed-days. Reads the session: render inside <Suspense>.
export async function ClosedDaysScreen() {
  await requireRole(["ADMIN"]);
  const today = manilaTodayISO();
  const [{ t, locale }, days] = await Promise.all([getServerI18n(), listClosedDays(today)]);
  return <ClosedDaysView t={t} locale={locale} today={today} upcoming={days.upcoming} past={days.past} />;
}

// The page layout, without data loading (also used by the dev preview).
export function ClosedDaysView({
  t,
  locale,
  today,
  upcoming,
  past,
}: {
  t: Dictionary;
  locale: Locale;
  today: string;
  upcoming: ClosedDay[];
  past: ClosedDay[];
}) {
  const c = t.closedDays;
  const long = new Intl.DateTimeFormat(locale === "fil" ? "fil-PH" : "en-PH", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const label = (iso: string) => long.format(parseISODate(iso)!);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title font-extrabold">{c.title}</h1>
          <p className="mt-2 max-w-[60ch] text-ink-soft">{c.intro}</p>
        </div>
        <ClosedDayDialog today={today} />
      </div>

      <section aria-labelledby="closed-upcoming" className="flex flex-col gap-3">
        <h2 id="closed-upcoming" className="text-lg font-bold">{c.upcoming}</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-10 text-center text-ink-soft shadow-[var(--shadow-soft)]">{c.empty}</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]">
            {upcoming.map((day) => (
              <li key={day.date} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <IconCircle icon={ClosedDayIcon} tone="blush" size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold">{label(day.date)}</p>
                    <p className="text-[0.95rem] break-words text-ink-soft">{day.reason}</p>
                    {day.booked > 0 && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-rose-deep">
                        <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0" />
                        {day.booked === 1 ? c.bookedOne : format(c.booked, { count: day.booked })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pl-12 sm:pl-0">
                  <RemoveClosedDayButton date={day.date} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="closed-past" className="flex flex-col gap-3">
          <h2 id="closed-past" className="text-lg font-bold">{c.past}</h2>
          <ul className="divide-y divide-line rounded-3xl bg-white/60 px-5 sm:px-6">
            {past.map((day) => (
              <li key={day.date} className="flex flex-col gap-0.5 py-3 text-[0.95rem] sm:flex-row sm:gap-4">
                <span className="font-medium text-ink-soft sm:w-72 sm:shrink-0">{label(day.date)}</span>
                <span className="text-ink-soft">{day.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
