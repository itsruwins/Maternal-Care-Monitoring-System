import { Check, TriangleAlert } from "lucide-react";
import { FolderCard } from "@/components/ui/folder-card";
import type { Dictionary } from "@/i18n/get-dictionary";

// "Paalala": general reminders, and the danger signs past a perforated tear
// line in brick ink. General information, not medical advice.
export function TipsSlip({ t }: { t: Dictionary }) {
  const tips = t.landing.tips;

  return (
    <FolderCard tab={t.landing.tabs.tips} labelledBy="tips-title" stacked>
      <div className="grid items-start lg:grid-cols-[1.15fr_0.85fr]">
        <div className="px-6 pt-8 sm:px-10 sm:pt-10">
          <h2 id="tips-title" className="display-print text-[clamp(2rem,4.4vw,3rem)] leading-[1]">
            {tips.title}
          </h2>
          <p className="mt-3 text-sm text-ink-label">{tips.note}</p>
          <ul className="mt-6 border-t border-rule">
            {tips.items.map((item) => (
              <li key={item} className="flex gap-3 border-b border-rule py-3.5">
                <Check className="mt-0.5 size-5 shrink-0 text-stamp" aria-hidden />
                <span className="text-[1rem] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 px-6 pt-8 sm:px-10 lg:mt-0 lg:pt-10">
          {/* Tear line: across the top on phones, down the side on wide screens */}
          <div className="perforation absolute inset-x-6 top-0 lg:hidden" aria-hidden />
          <div
            className="absolute inset-y-10 left-0 hidden w-0.5 bg-[radial-gradient(circle,var(--color-rule)_1px,transparent_1.5px)] bg-[length:2px_8px] bg-repeat-y lg:block"
            aria-hidden
          />
          <h3 className="flex items-start gap-2.5 text-lg leading-snug font-bold text-brick">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            {tips.dangerTitle}
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {tips.danger.map((sign) => (
              <li key={sign} className="flex gap-3 text-[1rem] leading-relaxed">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brick" aria-hidden />
                {sign}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FolderCard>
  );
}
