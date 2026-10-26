import { CheckCircleIcon, DangerIcon, WellbeingIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";

// General tips beside the danger signs (rose: act right away).
// General information only; the midwife's advice comes first.
export function Tips({ t }: { t: Dictionary }) {
  const tips = t.landing.tips;

  return (
    <section id="tips" aria-labelledby="tips-title" className="scroll-mt-6 bg-mint/60 px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start gap-4">
          <IconCircle icon={WellbeingIcon} tone="white" size="lg" weight="duotone" className="hidden text-rose-deep sm:inline-grid" />
          <div>
            <h2 id="tips-title" className="text-title max-w-[24ch] font-extrabold">
              {tips.title}
            </h2>
            <p className="mt-2 text-base text-ink-soft">{tips.note}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* Healthy habits and danger signs share one structure: a header of
              the same height (icon circle + title), then a one-column list with
              an icon per line, so both lists start and run on the same lines. */}
          <div className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex min-h-12 items-center gap-3">
              <IconCircle icon={CheckCircleIcon} tone="mint" size="sm" />
              <h3 className="text-lg leading-6 font-semibold text-balance text-leaf">{tips.habitsTitle}</h3>
            </div>
            <ul className="mt-5 flex flex-col gap-4">
              {tips.items.map((tip) => (
                <li key={tip} className="flex gap-3 text-base leading-6">
                  <CheckCircleIcon weight="fill" aria-hidden className="mt-0.5 size-5 shrink-0 text-fern" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-blush p-6 sm:p-8">
            <div className="flex min-h-12 items-center gap-3">
              <IconCircle icon={DangerIcon} tone="white" size="sm" className="text-rose-deep" />
              <h3 className="text-lg leading-6 font-semibold text-balance text-rose-deep">{tips.dangerTitle}</h3>
            </div>
            <ul className="mt-5 flex flex-col gap-4">
              {tips.danger.map((sign) => (
                <li key={sign} className="flex gap-3 text-base leading-6">
                  <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-5 shrink-0 text-rose-deep" />
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
