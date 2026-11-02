import { HeartIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatLongDay } from "../format";

// The rose welcome panel (kept from Phase 2), shortened: the heart circle,
// "Hello, {name}" and today's date.
export function GreetingPanel({ t, locale, firstName, today }: { t: Dictionary; locale: Locale; firstName: string; today: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(120%_120%_at_0%_0%,#f6e6e1_0%,#f2dfd6_55%,#eedfd2_100%)] p-6 sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1/2 -right-1/4 aspect-square w-3/4 rounded-full border-[24px] border-white/35"
      />
      <div className="relative flex items-center gap-4">
        <IconCircle icon={HeartIcon} tone="white" size="lg" className="shrink-0 text-rose-deep" />
        <div className="min-w-0">
          <h1 className="text-title font-extrabold break-words">{format(t.dashboard.greeting, { name: firstName })}</h1>
          <p className="tnum mt-1 text-ink-soft">{formatLongDay(today, locale)}</p>
        </div>
      </div>
    </section>
  );
}
