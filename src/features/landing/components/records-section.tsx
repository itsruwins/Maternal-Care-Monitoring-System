import Image from "next/image";
import { CheckIcon, CheckupIcon, ReminderIcon, VaccineIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";

const ROW_ICONS: Icon[] = [CheckupIcon, VaccineIcon, CheckupIcon];

// Her records on her phone: a photo beside a sample of the "My visits" list.
export function RecordsSection({ t }: { t: Dictionary }) {
  const r = t.landing.records;

  return (
    <section aria-labelledby="records-title" className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <Image
          src="/photos/mother-smiling.jpg"
          alt={r.photoAlt}
          width={1400}
          height={1865}
          sizes="(min-width: 768px) 42vw, 92vw"
          className="aspect-[4/5] w-full rounded-[2rem] object-cover md:max-h-[36rem]"
        />

        <div>
          <h2 id="records-title" className="text-title max-w-[18ch] font-bold">
            {r.title}
          </h2>
          <p className="mt-3 max-w-[48ch] text-lg leading-7 text-ink-soft">{r.body}</p>

          <figure className="mt-8 rounded-3xl bg-white p-5 shadow-[var(--shadow-raised)] sm:p-6">
            <figcaption className="flex items-center justify-between gap-3">
              <span className="text-lg font-semibold">{r.listTitle}</span>
              <span className="rounded-full bg-cream px-3 py-1 text-caption font-semibold text-ink-soft">{r.sample}</span>
            </figcaption>
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {r.rows.map((row, i) => {
                const upcoming = i === r.rows.length - 1;
                return (
                  <li key={`${row.activity}-${row.date}`} className="flex min-h-16 items-center gap-3.5 py-3">
                    <IconCircle icon={ROW_ICONS[i]} tone={upcoming ? "blush" : "mint"} size="sm" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[0.95rem] leading-5 font-semibold">{row.activity}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink-soft">
                        <span className="tnum whitespace-nowrap">{row.date}</span>
                        {upcoming && (
                          <span className="flex items-center gap-1 text-caption font-medium text-rose-deep">
                            <ReminderIcon weight="fill" aria-hidden className="size-3.5" />
                            {r.reminder}
                          </span>
                        )}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap",
                        upcoming ? "bg-leaf text-white" : "bg-mint text-leaf"
                      )}
                    >
                      {!upcoming && <CheckIcon weight="bold" aria-hidden className="size-3" />}
                      {row.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </figure>
        </div>
      </div>
    </section>
  );
}
