import * as React from "react"
import { cn } from "@/lib/utils/cn"

// A tabbed card resting on the folder. In a stack, each card is laid slightly
// over the one before it (negative top margin + upward shadow), so earlier
// cards sit beneath as you scroll. Cards keep generous bottom padding so the
// overlap only ever covers empty card stock.
function FolderCard({
  tab,
  labelledBy,
  stacked = false,
  className,
  bodyClassName,
  children,
}: {
  tab: React.ReactNode
  labelledBy?: string
  stacked?: boolean
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={labelledBy} className={cn("relative", stacked && "-mt-10 sm:-mt-12", className)}>
      <div className="card-stock label-print ml-5 inline-flex items-center rounded-t-lg border border-b-0 border-rule px-4 pt-2.5 pb-2 text-[0.7rem] sm:ml-8">
        {tab}
      </div>
      <div
        className={cn(
          "card-stock overflow-hidden rounded-lg rounded-tl-none border border-rule pb-12 sm:pb-14",
          stacked ? "shadow-[var(--shadow-card-stacked)]" : "shadow-[var(--shadow-card-lifted)]",
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export { FolderCard }
