import * as React from "react"
import { CaretDownIcon } from "@/components/icons"
import { cn } from "@/lib/utils/cn"

// The browser's own <select>, styled like our inputs (works great on phones:
// it opens the phone's native picker). A caret icon sits on the right.
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-12 w-full min-w-0 appearance-none rounded-lg border border-field bg-white pr-11 pl-4 text-base text-ink transition-[border-color,box-shadow] duration-150 outline-none hover:border-ink-soft focus-visible:border-leaf focus-visible:shadow-[0_0_0_4px_rgb(118_147_130/0.25)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-deep aria-invalid:shadow-[0_0_0_4px_rgb(217_165_160/0.3)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDownIcon
        weight="bold"
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-soft"
      />
    </div>
  )
}

export { NativeSelect }
