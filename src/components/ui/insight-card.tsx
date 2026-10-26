import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

// Flo's "daily insight" card: a tall rounded tile with a short title on top
// and a visual (icon circle, big number, action) at the bottom. Lives in a
// sideways-scrolling row (<InsightRow>).
const insightCardVariants = cva(
  "relative flex h-44 w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl p-3.5 text-left",
  {
    variants: {
      tone: {
        white: "bg-white shadow-[var(--shadow-soft)]",
        mint: "bg-mint",
        blush: "bg-blush",
        beige: "bg-beige",
        cream: "bg-cream",
      },
      selected: {
        true: "ring-2 ring-rose-deep ring-offset-2 ring-offset-milk",
        false: "",
      },
    },
    defaultVariants: { tone: "white", selected: false },
  }
)

function InsightCard({
  title,
  tone,
  selected,
  visual,
  className,
  children,
  ...props
}: VariantProps<typeof insightCardVariants> &
  Omit<React.ComponentProps<"article">, "title"> & {
    title: React.ReactNode
    /** Bottom area: an IconCircle, a big number, or an action. */
    visual?: React.ReactNode
  }) {
  return (
    <article className={cn(insightCardVariants({ tone, selected }), className)} {...props}>
      <h3 className="text-[0.95rem] leading-5 font-semibold text-ink">{title}</h3>
      {children}
      {visual && <div className="flex items-end justify-between gap-2">{visual}</div>}
    </article>
  )
}

// A sideways-scrolling row of insight cards that bleeds to the screen edge.
function InsightRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    />
  )
}

export { InsightCard, InsightRow, insightCardVariants }
