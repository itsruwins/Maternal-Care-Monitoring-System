import Image from "next/image";
import { CallIcon, ClockIcon, LocationIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { SITE } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const isPlaceholder = (value: string) => value.startsWith("PLACEHOLDER");

// Our own health center: the Mayon view every Taysan mother knows, beside the
// center's details (a detail not yet provided shows "To be announced").
export function HealthCenter({ t, locale }: { t: Dictionary; locale: Locale }) {
  const c = t.landing.center;
  const rows: { label: string; value: string; icon: Icon }[] = [
    { label: c.addressLabel, value: SITE.healthCenter.address, icon: LocationIcon },
    { label: c.hoursLabel, value: SITE.healthCenter.clinicHours[locale], icon: ClockIcon },
    { label: c.contactLabel, value: SITE.healthCenter.contactNumber, icon: CallIcon },
  ];

  return (
    <section id="center" aria-labelledby="center-title" className="scroll-mt-6 px-4 pb-16 sm:px-6 lg:pb-24">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-raised)] lg:grid-cols-2">
        <div className="relative min-h-60 sm:min-h-80">
          <Image
            src="/photos/mayon-rice-fields.jpg"
            alt={c.photoAlt}
            fill
            sizes="(min-width: 1024px) 576px, 100vw"
            className="object-cover object-[50%_42%]"
          />
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <h2 id="center-title" className="text-title max-w-[20ch] font-bold">
            {c.title}
          </h2>
          <p className="mt-3 max-w-[46ch] text-base leading-7 text-ink-soft">{c.body}</p>

          <dl className="mt-8 flex flex-col gap-5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-4">
                <IconCircle icon={row.icon} tone="mint" weight="duotone" />
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-ink-soft">{row.label}</dt>
                  <dd className="text-base font-semibold">
                    {isPlaceholder(row.value) ? (
                      <span className="inline-flex rounded-full bg-beige px-3 py-0.5 text-sm font-semibold text-ink-soft">
                        {t.common.tbd}
                      </span>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
