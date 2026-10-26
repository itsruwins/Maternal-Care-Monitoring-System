import * as React from "react"
import { cn } from "@/lib/utils/cn"

// A writable field on the card: paper fill, faint sides, a printed 2px base
// line (the visible boundary, 6:1 contrast). Focus thickens the line in ink.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "tnum h-11 w-full min-w-0 rounded-none border border-rule border-b-2 border-b-ink-label bg-paper px-3 text-base text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-label/75 focus-visible:border-b-press focus-visible:shadow-[0_2px_0_var(--color-press)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-b-brick aria-invalid:shadow-[0_2px_0_var(--color-brick)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
