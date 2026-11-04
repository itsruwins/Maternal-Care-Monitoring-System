import Link from "next/link";
import { CalendarPlusIcon, CheckupIcon, UserPlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatLongDay } from "../format";
import { QUICK_ACTIONS } from "../paths";
import type { DayPart } from "../types";

// The page head: "Good morning, {name}" and today's date on the left, the
// three everyday actions on the right. The actions wrap under the greeting
// when there is no room, and stack full width on phones.
export function DashboardHeader({
  t,
  locale,
  firstName,
  today,
  dayPart,
}: {
  t: Dictionary;
  locale: Locale;
  firstName: string;
  today: string;
  dayPart: DayPart;
}) {
  const d = t.dashboard;
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="min-w-0">
        <h1 className="text-title font-extrabold text-balance break-words">{format(d.greeting[dayPart], { name: firstName })}</h1>
        <p className="tnum mt-1.5 text-ink-soft">{formatLongDay(today, locale)}</p>
      </div>
      <nav aria-label={d.actionsLabel} className="w-full sm:w-auto">
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <li>
            <Button asChild className="w-full sm:w-auto">
              <Link href={QUICK_ACTIONS.walkIn}>
                <CheckupIcon weight="bold" aria-hidden />
                {d.actions.walkIn}
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={QUICK_ACTIONS.book}>
                <CalendarPlusIcon weight="bold" aria-hidden />
                {d.actions.book}
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={QUICK_ACTIONS.register}>
                <UserPlusIcon weight="bold" aria-hidden />
                {d.actions.register}
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
