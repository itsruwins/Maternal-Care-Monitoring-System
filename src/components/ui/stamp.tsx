import * as React from "react"
import { cn } from "@/lib/utils/cn"

type StampTone = "done" | "upcoming" | "missed"

const toneClass: Record<StampTone, string> = {
  done: "text-stamp border-stamp",
  upcoming: "text-press border-press",
  missed: "text-brick border-brick",
}

// A rubber stamp mark: double rule, condensed caps, slight tilt, uneven ink.
// `animate` plays the stamp-down once (skipped for reduced motion).
function Stamp({
  tone = "done",
  tilt = -6,
  animate = false,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"span"> & { tone?: StampTone; tilt?: number; animate?: boolean }) {
  return (
    <span
      data-slot="stamp"
      className={cn(
        "stamp-ink label-print inline-flex items-center gap-1.5 rounded-sm border-[3px] border-double px-2.5 py-1 text-[0.82rem] leading-none font-bold tracking-[0.1em]",
        toneClass[tone],
        animate && "animate-stamp",
        className
      )}
      style={{ ["--stamp-tilt" as string]: `${tilt}deg`, transform: `rotate(${tilt}deg)`, ...style }}
      {...props}
    >
      {children}
    </span>
  )
}

export { Stamp }
