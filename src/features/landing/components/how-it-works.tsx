import {
  AppointmentIcon,
  CheckupIcon,
  LanguageIcon,
  LocationIcon,
  PhoneIcon,
  ReminderIcon,
  SmsIcon,
  UserIcon,
  type Icon,
} from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";

const STEP_ICONS: Icon[] = [UserIcon, AppointmentIcon, SmsIcon, CheckupIcon];

// Four steps on a soft timeline, beside a sample of the reminder text she gets.
export function HowItWorks({ t }: { t: Dictionary }) {
  const how = t.landing.how;

  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-6 px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
        <div>
          <h2 id="how-title" className="text-title font-extrabold">
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

        {/* A sample of the SMS reminder, drawn like a phone's message thread */}
        <figure className="relative mx-auto w-full max-w-md">
          {/* floating "new reminder" badge */}
          <span
            aria-hidden
            className="absolute -top-4 right-4 z-10 inline-flex animate-float items-center gap-1.5 rounded-full bg-white py-1.5 pr-3.5 pl-2 text-caption font-semibold text-rose-deep shadow-[var(--shadow-raised)] sm:-right-4"
          >
            <span className="relative grid size-6 place-items-center rounded-full bg-blush">
              <ReminderIcon weight="fill" className="size-3.5" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-rose-deep ring-2 ring-white" />
            </span>
            {how.sms.newBadge}
          </span>

          <div className="relative overflow-hidden rounded-3xl bg-blush p-5 sm:p-7">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-1/3 -bottom-1/3 aspect-square w-3/4 rounded-full border-[22px] border-white/35"
            />
            <figcaption className="relative text-caption font-semibold tracking-[0.02em] text-rose-deep uppercase">
              {how.sms.label}
            </figcaption>

            {/* thread header */}
            <div className="relative mt-4 flex items-center gap-3 border-b border-rose/40 pb-4">
              <IconCircle icon={SmsIcon} tone="leaf" size="md" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[0.95rem] leading-5 font-semibold">{how.sms.sender}</span>
                <span className="text-caption text-ink-soft">{how.sms.meta}</span>
              </span>
            </div>

            {/* messages */}
            <div className="relative mt-4 flex flex-col gap-2">
              <p className="sm:max-w-[90%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[0.95rem] leading-6 shadow-[var(--shadow-soft)]">
                {how.sms.greeting}
              </p>

              <div className="flex sm:max-w-[90%] items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-[var(--shadow-soft)]">
                <IconCircle icon={AppointmentIcon} tone="blush" size="md" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[0.95rem] leading-5 font-bold">{how.sms.apptTitle}</span>
                  <span className="tnum mt-0.5 text-sm leading-5 text-ink-soft">{how.sms.apptWhen}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-sm leading-5 text-ink-soft">
                    <LocationIcon weight="fill" aria-hidden className="size-3.5 shrink-0 text-rose-deep" />
                    {how.sms.apptWhere}
                  </span>
                </span>
              </div>

              <p className="sm:max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[0.95rem] leading-6 shadow-[var(--shadow-soft)]">
                {how.sms.closing}
              </p>
              <span className="tnum pl-1 text-caption text-ink-soft">{how.sms.time}</span>
            </div>

            {/* what SMS means for her */}
            <ul className="relative mt-5 grid gap-2 border-t border-rose/40 pt-4 sm:grid-cols-2">
              {how.sms.facts.map((fact, i) => {
                const FactIcon = i === 0 ? PhoneIcon : LanguageIcon;
                return (
                  <li key={fact} className="flex items-start gap-2 text-sm leading-5 text-ink">
                    <FactIcon weight="duotone" aria-hidden className="mt-px size-[1.125rem] shrink-0 text-leaf" />
                    {fact}
                  </li>
                );
              })}
            </ul>
          </div>
        </figure>
      </div>
    </section>
  );
}
