import * as React from "react"
import type { Icon } from "@/components/icons"
import { cn } from "@/lib/utils/cn"

// A leading icon inside a text field (user, lock, phone...). Give the <Input>
// inside `pl-11` so its text clears the icon.
function InputIcon({
  icon: Glyph,
  className,
  children,
}: {
  icon: Icon
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative", className)}>
      <Glyph
        aria-hidden
        weight="regular"
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-soft"
      />
      {children}
    </div>
  )
}

export { InputIcon }
