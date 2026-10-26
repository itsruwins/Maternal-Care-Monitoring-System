"use client"

import * as React from "react"
import { DropdownMenu as MenuPrimitive } from "radix-ui"
import { cn } from "@/lib/utils/cn"

// A small floating menu (e.g. the profile menu in the top bar): white rounded
// card, soft shadow, 44px rows. Keyboard and screen-reader support from Radix.

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger

function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "end",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-56 overflow-hidden rounded-2xl bg-white p-1.5 text-ink shadow-[var(--shadow-float)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium outline-none select-none data-highlighted:bg-cream data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-ink-soft",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label className={cn("px-3 pt-2 pb-2.5", className)} {...props} />
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn("my-1 h-px bg-line", className)} {...props} />
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger }
