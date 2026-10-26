import Image from "next/image";
import { FolderCard } from "@/components/ui/folder-card";
import { Stamp } from "@/components/ui/stamp";
import type { Dictionary } from "@/i18n/get-dictionary";

// Your records on your phone: the photo beside a fragment of a (sample) card,
// past visits stamped done and the next balik carrying the SMS stamp.
export function RecordsSection({ t }: { t: Dictionary }) {
  const r = t.landing.records;

  return (
    <FolderCard tab={t.landing.tabs.records} labelledBy="records-title" stacked>
      <div className="grid gap-8 px-6 pt-8 sm:px-10 sm:pt-10 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
        <Image
          src="/photos/mother-smiling.jpg"
          alt={r.photoAlt}
          width={1400}
          height={1865}
          sizes="(min-width: 768px) 38vw, 90vw"
          className="aspect-[4/5] w-full rounded-md object-cover md:aspect-auto md:h-full md:max-h-[34rem]"
        />

        <div className="flex flex-col">
          <h2 id="records-title" className="display-print text-[clamp(2rem,4.4vw,3rem)] leading-[1]">
            {r.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-relaxed text-ink/80">{r.body}</p>

          <figure className="mt-8 rounded-md border border-rule bg-paper/70">
            <figcaption className="label-print border-b border-rule px-4 py-2.5 text-[0.7rem]">{r.sampleLabel}</figcaption>
            <ul>
              {r.sampleRows.map((row) => (
                <li key={row.activity} className="flex min-h-14 items-center justify-between gap-4 border-b border-rule px-4 py-2">
                  <span className="text-[0.95rem] font-semibold">{row.activity}</span>
                  <span className="flex items-center gap-3">
                    <span className="hand tnum text-lg whitespace-nowrap text-ink-label">{row.date}</span>
                    <Stamp tone="done" tilt={-6}>
                      {t.landing.how.stampDone}
                    </Stamp>
                  </span>
                </li>
              ))}
              <li className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
                <span className="label-print text-[0.72rem]">{t.landing.nextLabel}</span>
                <span className="flex flex-wrap items-center justify-end gap-3">
                  <span className="hand text-lg text-ink">{t.landing.nextValue}</span>
                  <Stamp tone="upcoming" tilt={-5}>
                    {t.landing.smsStamp}
                  </Stamp>
                </span>
              </li>
            </ul>
          </figure>
        </div>
      </div>
    </FolderCard>
  );
}
