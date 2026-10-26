import { AppointmentIcon, CheckupIcon, SmsIcon, UserIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";

const STEP_ICONS: Icon[] = [UserIcon, AppointmentIcon, SmsIcon, CheckupIcon];

// Four steps on a soft timeline, beside a sample of the reminder text she gets.
export function HowItWorks({ t }: { t: Dictionary }) {
  const how = t.landing.how;

  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-6 px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        <div>
          <h2 id="how-title" className="text-title font-bold">
            {how.title}
          </h2>
          <p className="mt-3 max-w-[46ch] text-lg leading-7 text-ink-soft">{how.intro}</p>

          <ol className="mt-10 flex flex-col">
            {how.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                {i < how.steps.length - 1 && (
                  <span aria-hidden className="absolute top-14 bottom-2 left-6 w-0 border-l-2 border-dashed border-sage" />
                )}
                <IconCircle icon={STEP_ICONS[i]} tone={i === 2 ? "leaf" : "mint"} />
                <div className="pt-1.5">
                  <h3 className="text-lg leading-6 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-[48ch] text-base leading-6 text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* A sample of the SMS reminder */}
        <figure className="relative mx-auto w-full max-w-sm rounded-3xl bg-blush p-6 sm:p-8">
          <figcaption className="text-caption font-semibold tracking-[0.02em] text-rose-deep uppercase">{how.sms.label}</figcaption>
          <div className="mt-5 flex items-center gap-3">
            <IconCircle icon={SmsIcon} tone="leaf" size="sm" />
            <span className="flex flex-col">
              <span className="text-[0.95rem] leading-5 font-semibold">{how.sms.sender}</span>
              <span className="tnum text-caption text-ink-soft">{how.sms.time}</span>
            </span>
          </div>
          <p className="mt-4 rounded-2xl rounded-tl-md bg-white px-4 py-3.5 text-[0.95rem] leading-6 shadow-[var(--shadow-soft)]">
            {how.sms.body}
          </p>
        </figure>
      </div>
    </section>
  );
}
