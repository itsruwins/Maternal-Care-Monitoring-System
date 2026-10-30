import * as React from "react"
import { cn } from "@/lib/utils/cn"

// Multi-line field, styled like <Input>.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full min-w-0 rounded-lg border border-field bg-white px-4 py-3 text-base text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-soft hover:border-ink-soft focus-visible:border-leaf focus-visible:shadow-[0_0_0_4px_rgb(118_147_130/0.25)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-deep aria-invalid:shadow-[0_0_0_4px_rgb(217_165_160/0.3)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
