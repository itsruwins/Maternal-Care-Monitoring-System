import * as React from "react"
import { cn } from "@/lib/utils/cn"

// Flo's week strip: seven days in a row, each date in a circle whose style
// shows what is on that day. Display only.
export type WeekDayState = "none" | "appointment" | "requested" | "done" | "missed"

export type WeekDay = {
  key: string
  /** Short weekday shown above the date ("M", "T", or "Today"). */
  weekday: string
  day: number | string
  state?: WeekDayState
  isToday?: boolean
  /** Full description for screen readers, e.g. "Tuesday 3 November, prenatal checkup". */
  label: string
}

const stateClass: Record<WeekDayState, string> = {
  none: "text-ink",
  appointment: "bg-leaf text-white",
  requested: "border-2 border-dashed border-leaf text-leaf",
  done: "bg-mint text-leaf",
  missed: "bg-blush text-rose-deep",
}

function WeekStrip({ days, className, ...props }: { days: WeekDay[] } & React.ComponentProps<"ol">) {
  return (
    <ol className={cn("grid grid-cols-7 gap-1", className)} {...props}>
      {days.map((d) => {
        const state = d.state ?? "none"
        return (
          <li key={d.key} className="flex flex-col items-center gap-2">
            <span className="sr-only">{d.label}</span>
            <span
              aria-hidden
              className={cn(
                "h-4 text-caption leading-4 font-medium tracking-[0.02em] whitespace-nowrap uppercase",
                d.isToday ? "text-[0.625rem] font-bold tracking-normal text-ink" : "text-ink-soft"
              )}
            >
              {d.weekday}
            </span>
            <span
              aria-hidden
              className={cn(
                "tnum grid size-10 place-items-center rounded-full text-[1.0625rem] font-medium",
                stateClass[state],
                d.isToday && state === "none" && "bg-white font-semibold shadow-[var(--shadow-soft)]",
                d.isToday && state !== "none" && "ring-[3px] ring-white ring-offset-0 shadow-[var(--shadow-soft)]"
              )}
            >
              {d.day}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export { WeekStrip }
