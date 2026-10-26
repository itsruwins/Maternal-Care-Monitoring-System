import * as React from "react"
import { cn } from "@/lib/utils/cn"

// A soft tinted panel whose bottom edge bulges down in a gentle curve (Flo).
// A faint ring in the corner adds depth without adding content.
type Tone = "rose" | "green" | "beige"

const toneClass: Record<Tone, string> = {
  rose: "bg-[radial-gradient(120%_90%_at_50%_0%,#f6e6e1_0%,#f2dfd6_55%,#ead9c9_100%)]",
  green: "bg-[radial-gradient(120%_90%_at_50%_0%,#eef2ec_0%,#e3eae4_55%,#d6e0d8_100%)]",
  beige: "bg-[radial-gradient(120%_90%_at_50%_0%,#f7f1e6_0%,#efe6d6_55%,#e8ddc9_100%)]",
}

function CurvedHero({
  tone = "rose",
  curve = "md",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { tone?: Tone; curve?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        toneClass[tone],
        curve === "sm" && "rounded-b-[50%_1.75rem]",
        curve === "md" && "rounded-b-[50%_2.75rem]",
        curve === "lg" && "rounded-b-[50%_4.5rem]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[40%] -right-[30%] -z-10 aspect-square w-[95%] rounded-full border-[28px] border-white/35"
      />
      {children}
    </div>
  )
}

export { CurvedHero }
