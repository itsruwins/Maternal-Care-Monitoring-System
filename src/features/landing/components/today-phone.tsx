import {
  AppointmentIcon,
  CalendarIcon,
  DangerIcon,
  HomeIcon,
  PlusIcon,
  PregnancyIcon,
  ProfileIcon,
  RecordsIcon,
  SmsIcon,
  SupplementIcon,
  type Icon,
} from "@/components/icons";
import { CurvedHero } from "@/components/ui/curved-hero";
import { IconCircle } from "@/components/ui/icon-circle";
import { InsightCard, InsightRow } from "@/components/ui/insight-card";
import { WeekStrip, type WeekDay, type WeekDayState } from "@/components/ui/week-strip";
import { cn } from "@/lib/utils/cn";

export type TodayPhoneCopy = {
  /** Read by screen readers instead of the screen's contents. */
  description: string;
  date: string;
  /** Seven narrow weekday names, Sunday first. */
  weekdays: string[];
  today: string;
  weeks: string;
  due: string;
  forYou: string;
  nextVisit: { title: string; date: string };
  tip: { title: string };
  danger: { title: string };
  request: { title: string };
  tabs: { today: string; visits: string; book: string; sms: string; me: string };
};

// Sample week: Sunday 1 to Saturday 7; today is the 4th, a lab test was done
// on the 2nd, and a prenatal checkup is booked for the 6th.
const SAMPLE_WEEK: { day: number; state: WeekDayState }[] = [
  { day: 1, state: "none" },
  { day: 2, state: "done" },
  { day: 3, state: "none" },
  { day: 4, state: "none" },
  { day: 5, state: "none" },
  { day: 6, state: "appointment" },
  { day: 7, state: "none" },
];
const TODAY = 4;

// A phone showing the mother portal's "Today" screen, built in code (Flo's
// pregnancy screen in our palette). Illustrative sample data only.
export function TodayPhone({ copy, className }: { copy: TodayPhoneCopy; className?: string }) {
  const days: WeekDay[] = SAMPLE_WEEK.map(({ day, state }, i) => ({
    key: String(day),
    weekday: day === TODAY ? copy.today : copy.weekdays[i],
    day,
    state,
    isToday: day === TODAY,
    label: "",
  }));

  const tabs: { label: string; icon: Icon; active?: boolean }[] = [
    { label: copy.tabs.today, icon: HomeIcon, active: true },
    { label: copy.tabs.visits, icon: RecordsIcon },
    { label: copy.tabs.book, icon: AppointmentIcon },
    { label: copy.tabs.sms, icon: SmsIcon },
    { label: copy.tabs.me, icon: ProfileIcon },
  ];

  return (
    <figure className={cn("relative w-[18.5rem] shrink-0", className)}>
      <figcaption className="sr-only">{copy.description}</figcaption>
      <div aria-hidden className="rounded-[2.9rem] bg-ink p-2.5 shadow-[var(--shadow-float)]">
        <div className="relative h-[40rem] overflow-hidden rounded-[2.4rem] bg-milk">
          <CurvedHero tone="rose" curve="md" className="pb-7">
            {/* status bar */}
            <div className="flex items-center justify-between px-6 pt-3 text-[0.8rem] font-semibold">
              <span className="tnum">9:41</span>
              <span className="h-[1.375rem] w-[5.5rem] rounded-full bg-ink" />
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-4 rounded-[3px] border-[1.5px] border-ink" />
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between px-4">
              <span className="grid size-8 place-items-center rounded-full bg-white shadow-[var(--shadow-soft)]">
                <PregnancyIcon weight="fill" className="size-[1.125rem] text-rose-deep" />
              </span>
              <span className="text-[0.95rem] font-semibold">{copy.date}</span>
              <CalendarIcon weight="regular" className="size-6 text-ink" />
            </div>

            <WeekStrip days={days} className="mt-3 px-2.5" />

            <div className="mt-4 flex flex-col items-center px-4 text-center">
              <span className="relative grid size-[4.75rem] place-items-center rounded-full bg-white/55">
                <span className="grid size-14 place-items-center rounded-full bg-rose/45">
                  <PregnancyIcon weight="duotone" className="size-8 text-rose-deep" />
                </span>
              </span>
              <p className="tnum mt-2.5 text-[1.625rem] leading-8 font-bold tracking-[-0.025em] text-ink">{copy.weeks}</p>
              <span className="mt-3 inline-flex h-8 items-center rounded-full bg-white px-4 text-[0.8rem] font-semibold text-leaf shadow-[var(--shadow-soft)]">
                {copy.due}
              </span>
            </div>
          </CurvedHero>

          <div className="px-4 pt-4">
            <p className="text-[1.0625rem] font-bold tracking-[-0.01em]">{copy.forYou}</p>
            <InsightRow className="mt-2.5 gap-2.5">
              <InsightCard
                title={copy.nextVisit.title}
                selected
                className="h-36 w-[7.25rem]"
                visual={
                  <span className="tnum text-[1.625rem] leading-8 font-bold tracking-[-0.025em] whitespace-nowrap">
                    {copy.nextVisit.date}
                  </span>
                }
              />
              <InsightCard
                title={copy.tip.title}
                tone="mint"
                className="h-36 w-[7.25rem]"
                visual={<IconCircle icon={SupplementIcon} tone="fern" size="md" />}
              />
              <InsightCard
                title={copy.danger.title}
                tone="blush"
                className="h-36 w-[7.25rem]"
                visual={<IconCircle icon={DangerIcon} tone="white" size="md" className="text-rose-deep" />}
              />
              <InsightCard
                title={copy.request.title}
                className="h-36 w-[7.25rem]"
                visual={
                  <span className="grid size-10 place-items-center rounded-full bg-leaf text-white">
                    <PlusIcon weight="bold" className="size-5" />
                  </span>
                }
              />
            </InsightRow>
          </div>

          {/* bottom tab bar: outline icons, the selected one filled */}
          <nav className="absolute inset-x-0 bottom-0 grid grid-cols-5 border-t border-line bg-white/95 px-1 pt-2 pb-5">
            {tabs.map(({ label, icon: TabIcon, active }) => (
              <span key={label} className={cn("flex flex-col items-center gap-1", active ? "text-ink" : "text-ink-soft")}>
                <TabIcon weight={active ? "fill" : "regular"} className="size-6" />
                <span className={cn("text-[0.625rem] leading-none", active ? "font-semibold" : "font-medium")}>{label}</span>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </figure>
  );
}
