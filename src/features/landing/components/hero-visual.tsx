import type { ReactNode } from "react";
import Image from "next/image";
import { AppointmentIcon, SmsIcon } from "@/components/icons";
import { FetusIcon } from "@/components/icons/fetus-icon";
import { FetusPicture } from "@/components/shared/fetus-picture";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Trimester } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";

export type HeroCardsView = {
  /** "24 weeks, 3 days" */
  weeks: string;
  /** "Due Feb 12, 2027" */
  due: string;
  trimester: Trimester;
  /** Next visit, or null when the midwife hasn't set one yet. */
  nextVisit: string | null;
  /** true once she has entered her own date */
  isEstimate: boolean;
};

// The mother (a soft illustration) at the center, in a soft arch, with what the system does for her
// floating around: her weeks (with the trimester picture), the SMS reminder
// and the next visit. Cards sit clear of her face. Sample data until she
// enters her date in the hero's estimate card.
export function HeroVisual({
  copy,
  view,
  className,
}: {
  copy: Dictionary["landing"]["heroCards"];
  view: HeroCardsView;
  className?: string;
}) {
  return (
    <figure className={cn("relative mx-auto w-full max-w-[24rem] px-5 pb-8 sm:max-w-[28rem] sm:px-10 lg:w-[30rem] lg:max-w-none lg:px-12", className)}>
      <figcaption className="sr-only">{copy.description}</figcaption>

      {/* The arch: a soft rose-to-beige panel. The mother illustration sits in
          it, her head rising a little above the top. A soft glowing circle on
          her belly shows the baby (same glyph as the weeks card). */}
      <div className="relative aspect-[4/5]">
        <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] bg-[linear-gradient(180deg,#eac6be_0%,#f0dcd2_55%,#e8ddc9_100%)] shadow-[var(--shadow-raised)] ring-1 ring-white/70">
          <span className="absolute -bottom-1/4 left-1/2 aspect-square w-[130%] -translate-x-1/2 rounded-full border-[24px] border-white/40" />
        </div>
        <div className="absolute inset-x-0 -top-[6%] bottom-0 [clip-path:inset(0_round_0_0_2.5rem_2.5rem)]">
          <div className="relative">
            <Image
              src="/illustrations/mother.webp"
              alt={copy.photoAlt}
              width={1008}
              height={1280}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 384px, (min-width: 640px) 368px, 86vw"
              className="h-auto w-full"
            />
            <span className="absolute top-[63%] left-[53%] grid aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/60 shadow-[0_0_0_10px_rgb(255_255_255/0.25),0_0_48px_12px_rgb(255_255_255/0.55)]">
              <FetusIcon className="h-auto w-[70%] text-rose-deep" />
            </span>
          </div>
        </div>
      </div>

      {/* SMS reminder: left, over her back (desktop only; phones and tablets show just the weeks card) */}
      <div
        aria-hidden
        className="absolute top-[50%] left-0 hidden w-[14rem] animate-float rounded-2xl bg-white p-4 shadow-[var(--shadow-raised)] [animation-delay:-2s] lg:block"
      >
        <SampleBadge>{copy.sample}</SampleBadge>
        <div className="flex items-center gap-2.5">
          <IconCircle icon={SmsIcon} tone="leaf" size="sm" className="size-8 [&_svg]:size-4" />
          <span className="text-[0.8125rem] leading-4 font-semibold whitespace-nowrap">{copy.smsSender}</span>
        </div>
        <p className="mt-3 text-[0.875rem] leading-5 text-ink">{copy.smsBody}</p>
      </div>

      {/* Her weeks, with the baby picture: top right, clear of her face and
          belly; on phones and tablets it sits at the bottom right */}
      <div aria-hidden className="absolute right-0 bottom-0 animate-float lg:top-[12%] lg:-right-4 lg:bottom-auto">
        <div
          key={view.weeks}
          className="relative flex animate-in items-center gap-3 rounded-2xl bg-white py-3 pr-4 pl-3 shadow-[var(--shadow-float)] fade-in slide-in-from-bottom-2 duration-500 ease-[var(--ease-out-expo)]"
        >
          <SampleBadge>{view.isEstimate ? copy.yours : copy.sample}</SampleBadge>
          <FetusPicture trimester={view.trimester} className="w-12" />
          <span className="flex flex-col">
            <span className="tnum text-[1.0625rem] leading-6 font-bold tracking-[-0.01em] whitespace-nowrap">{view.weeks}</span>
            <span className="tnum text-[0.8125rem] leading-5 whitespace-nowrap text-ink-soft">{view.due}</span>
          </span>
        </div>
      </div>

      {/* Next visit: bottom right (desktop only) */}
      <div
        aria-hidden
        className="absolute right-1 bottom-2 hidden animate-float items-center gap-2.5 rounded-2xl bg-white py-3 pr-5 pl-3 shadow-[var(--shadow-raised)] [animation-delay:-4s] lg:flex"
      >
        {view.nextVisit && <SampleBadge>{copy.sample}</SampleBadge>}
        <IconCircle icon={AppointmentIcon} tone="blush" size="sm" />
        <span className="flex flex-col">
          <span className="text-caption leading-4 text-ink-soft">{copy.nextVisit}</span>
          <span className="tnum text-[0.95rem] leading-5 font-semibold whitespace-nowrap">
            {view.nextVisit ?? copy.nextVisitUnset}
          </span>
        </span>
      </div>
    </figure>
  );
}

// The small leaf pill on a floating card: "Sample" (or "Your estimate").
function SampleBadge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -top-2.5 left-3 rounded-full bg-leaf px-2 py-0.5 text-[0.6875rem] leading-4 font-semibold text-white">
      {children}
    </span>
  );
}
