import Image from "next/image";
import { FolderCard } from "@/components/ui/folder-card";
import { Stamp } from "@/components/ui/stamp";
import { SITE } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";

const isPlaceholder = (value: string) => value.startsWith("PLACEHOLDER");

// Our own health center: the Mayon horizon every Taysan mother knows, printed
// at the top of the card, with the center's details in ruled rows below.
export function HealthCenter({ t }: { t: Dictionary }) {
  const c = t.landing.center;
  const rows = [
    { label: c.addressLabel, value: SITE.healthCenter.address },
    { label: c.hoursLabel, value: SITE.healthCenter.clinicHours },
    { label: c.contactLabel, value: SITE.healthCenter.contactNumber },
  ];

  return (
    <FolderCard tab={t.landing.tabs.center} labelledBy="center-title" stacked>
      <div className="relative h-[clamp(13rem,32vw,22rem)] border-b border-rule">
        <Image
          src="/photos/mayon-rice-fields.jpg"
          alt={c.photoAlt}
          fill
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover object-[50%_42%]"
        />
      </div>
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="px-6 pt-8 sm:px-10 sm:pt-10">
          <h2 id="center-title" className="display-print text-[clamp(2rem,4.4vw,3rem)] leading-[1]">
            {c.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[1.02rem] leading-relaxed text-ink/80">{c.body}</p>
        </div>
        <dl className="mx-6 mt-8 border-t border-rule sm:mx-10 md:mt-10 md:ml-0">
          {rows.map((row) => (
            <div key={row.label} className="flex min-h-[4.25rem] flex-col justify-center gap-1.5 border-b border-rule py-3">
              <dt className="label-print text-[0.72rem]">{row.label}</dt>
              <dd>
                {isPlaceholder(row.value) ? (
                  <Stamp tone="upcoming" tilt={-3} className="text-[0.72rem]">
                    {t.common.tbd}
                  </Stamp>
                ) : (
                  <span className="hand text-lg">{row.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </FolderCard>
  );
}
