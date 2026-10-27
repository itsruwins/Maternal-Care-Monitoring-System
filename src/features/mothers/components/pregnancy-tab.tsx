import type { ReactNode } from "react";
import { PregnancyIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { daysBetween, formatDate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import { summarizeRecords } from "../pregnancy-summary";
import type { MotherRecord, PregnancyRecord } from "../types";
import { ClosePregnancyDialog, CurrentPregnancyDialog, PastPregnancyDialog } from "./pregnancy-dialogs";
import { TrimesterPicture } from "./trimester-picture";

// The Pregnancy tab: the current pregnancy (weeks, due date, G/P) with Edit
// and Close, or "Start a new pregnancy"; then her past pregnancies.
export function PregnancyTab({ t, locale, mother, today }: { t: Dictionary; locale: Locale; mother: MotherRecord; today: string }) {
  const p = t.mothers.record.pregnancy;
  const date = (iso: string | null) => (iso ? formatDate(iso, locale) : p.notRecorded);

  return (
    <div className="flex flex-col gap-6">
      {mother.current ? (
        <CurrentCard t={t} locale={locale} motherId={mother.id} pregnancy={mother.current} today={today} />
      ) : (
        <section className="flex flex-col items-start gap-4 rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:p-8">
          <IconCircle icon={PregnancyIcon} tone="blush" size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{p.none}</h2>
            <p className="mt-1 text-ink-soft">{p.noneHint}</p>
          </div>
          <CurrentPregnancyDialog motherId={mother.id} today={today} />
        </section>
      )}

      <section aria-labelledby="past-pregnancies" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="past-pregnancies" className="text-xl font-bold">{p.history}</h2>
          <PastPregnancyDialog motherId={mother.id} today={today} />
        </div>
        {mother.past.length === 0 ? (
          <p className="mt-4 text-ink-soft">{p.historyEmpty}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {mother.past.map((pregnancy) => (
              <li key={pregnancy.id} className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:justify-between">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="flex flex-wrap items-center gap-2">
                    <OutcomeChip t={t} pregnancy={pregnancy} />
                    <span className="tnum text-[0.95rem] font-semibold">{date(pregnancy.outcomeDate)}</span>
                  </span>
                  <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                    <span className="tnum">{format(p.gp, { gravida: pregnancy.gravida, para: pregnancy.para })}</span>
                    {pregnancy.edd && (
                      <span className="tnum">
                        {p.due}: {formatDate(pregnancy.edd, locale)}
                      </span>
                    )}
                  </span>
                  {pregnancy.remarks && <p className="text-sm break-words text-ink-soft">{pregnancy.remarks}</p>}
                </div>
                <PastPregnancyDialog motherId={mother.id} pregnancy={pregnancy} today={today} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CurrentCard({
  t,
  locale,
  motherId,
  pregnancy,
  today,
}: {
  t: Dictionary;
  locale: Locale;
  motherId: number;
  pregnancy: PregnancyRecord;
  today: string;
}) {
  const p = t.mothers.record.pregnancy;
  const summary = summarizeRecords([pregnancy], today);
  const daysLeft = pregnancy.edd ? daysBetween(today, pregnancy.edd) : null;
  const countdown =
    daysLeft === null ? null : daysLeft > 1 ? format(p.dueIn, { days: daysLeft }) : daysLeft === 1 ? p.dueInOne : daysLeft === 0 ? p.dueToday : format(p.overdue, { days: -daysLeft });

  const rows: [string, ReactNode][] = [
    [p.due, pregnancy.edd ? formatDate(pregnancy.edd, locale) : p.notRecorded],
    [p.lmp, pregnancy.lmp ? formatDate(pregnancy.lmp, locale) : p.notRecorded],
    [p.gpLabel, format(p.gp, { gravida: pregnancy.gravida, para: pregnancy.para })],
  ];
  if (pregnancy.remarks) rows.push([p.remarks, pregnancy.remarks]);

  return (
    <section aria-labelledby="current-pregnancy" className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="current-pregnancy" className="text-xl font-bold">{p.current}</h2>
        <div className="flex flex-wrap gap-2">
          <CurrentPregnancyDialog motherId={motherId} pregnancy={pregnancy} today={today} />
          <ClosePregnancyDialog motherId={motherId} pregnancy={pregnancy} today={today} />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          {summary.kind === "active" && summary.trimester && <TrimesterPicture trimester={summary.trimester} className="size-24 sm:size-28" />}
          <div>
            {summary.kind === "active" && summary.weeks !== null && (
              <p className="tnum text-[2rem] leading-tight font-extrabold tracking-[-0.02em]">{format(t.mothers.week, { weeks: summary.weeks })}</p>
            )}
            {summary.kind === "active" && summary.trimester && <p className="text-ink-soft">{t.mothers.trimesters[summary.trimester - 1]}</p>}
            {countdown && (
              <p className={cn("mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold", daysLeft !== null && daysLeft < 0 ? "bg-blush text-rose-deep" : "bg-mint text-leaf")}>
                {countdown}
              </p>
            )}
          </div>
        </div>
        <dl className="grid flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-[0.95rem] md:border-l md:border-line md:pl-6">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="tnum min-w-0 font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function OutcomeChip({ t, pregnancy }: { t: Dictionary; pregnancy: PregnancyRecord }) {
  const outcome = pregnancy.outcome ?? "OTHER";
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap",
        outcome === "LIVE_BIRTH" ? "bg-mint text-leaf" : "bg-cream text-ink-soft",
      )}
    >
      {t.mothers.record.pregnancy.outcomes[outcome]}
    </span>
  );
}

