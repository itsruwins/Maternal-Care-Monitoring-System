import { FolderCard } from "@/components/ui/folder-card";
import { Stamp } from "@/components/ui/stamp";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";

// Four slots on the card, in visit order. The first two are stamped done, the
// third carries the SMS stamp, the fourth waits: every state stays visible.
export function HowItWorks({ t }: { t: Dictionary }) {
  const steps = t.landing.how.steps;

  return (
    <FolderCard tab={t.landing.tabs.how} labelledBy="how-title">
      <div className="px-6 pt-8 sm:px-10 sm:pt-10">
        <h2 id="how-title" className="display-print text-[clamp(2rem,4.4vw,3rem)] leading-[1]">
          {t.landing.how.title}
        </h2>
      </div>
      <ol className="mt-8 grid border-y border-rule sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              "flex min-h-52 flex-col gap-3 px-6 py-6 sm:px-8",
              index > 0 && "border-t border-dashed border-rule sm:border-t-0",
              index % 2 === 1 && "sm:border-l sm:border-dashed",
              index >= 2 && "sm:border-t sm:border-dashed lg:border-t-0",
              index === 2 && "lg:border-l lg:border-dashed"
            )}
          >
            <span className="hand tnum text-4xl leading-none text-ink-label" aria-hidden>
              {index + 1}
            </span>
            <h3 className="text-lg leading-snug font-bold">{step.title}</h3>
            <p className="text-[0.95rem] leading-relaxed text-ink/80">{step.body}</p>
            <div className="mt-auto pt-3">
              {index < 2 && (
                <Stamp tone="done" tilt={index === 0 ? -8 : -4}>
                  {t.landing.how.stampDone}
                </Stamp>
              )}
              {index === 2 && (
                <Stamp tone="upcoming" tilt={-6}>
                  {t.landing.smsStamp}
                </Stamp>
              )}
              {index === 3 && <span className="block h-7 w-24 rounded-sm border-2 border-dashed border-rule" aria-hidden />}
            </div>
          </li>
        ))}
      </ol>
    </FolderCard>
  );
}
