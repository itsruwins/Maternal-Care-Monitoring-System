import * as React from "react"
import { cn } from "@/lib/utils/cn"

// Soft rounded field: white fill, a 3:1 border, a gentle green glow on focus.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "tnum h-12 w-full min-w-0 rounded-lg border border-field bg-white px-4 text-base text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-soft hover:border-ink-soft focus-visible:border-leaf focus-visible:shadow-[0_0_0_4px_rgb(118_147_130/0.25)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-deep aria-invalid:shadow-[0_0_0_4px_rgb(217_165_160/0.3)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
