"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { CloseIcon } from "@/components/icons"
import { cn } from "@/lib/utils/cn"

// A panel that slides in from the left edge (the staff menu on phones and
// tablets). Built on the dialog primitive: focus is trapped, Esc closes it.

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetTitle = SheetPrimitive.Title
const SheetDescription = SheetPrimitive.Description

function SheetContent({
  className,
  children,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { closeLabel?: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <SheetPrimitive.Content
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col overflow-y-auto bg-white shadow-[var(--shadow-float)] outline-none data-open:animate-in data-open:slide-in-from-left-full data-open:duration-300 data-open:ease-[var(--ease-out-expo)] data-closed:animate-out data-closed:slide-out-to-left-full data-closed:duration-200",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-3.5 right-3.5 inline-flex size-11 items-center justify-center rounded-full bg-cream text-ink-soft transition-colors hover:bg-beige hover:text-ink focus-visible:outline-2 focus-visible:outline-leaf">
          <CloseIcon weight="bold" className="size-[1.125rem]" aria-hidden />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger }
