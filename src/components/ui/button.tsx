import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils/cn"

// Balik Card buttons: printed-ink rectangles with a small radius, 44px tap
// targets by default (mothers on phones), a short press-down on click.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md border-2 text-[0.95rem] font-semibold whitespace-nowrap select-none outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[var(--ease-out-expo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-press active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-55 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.15em]",
  {
    variants: {
      variant: {
        default:
          "border-press bg-press text-card-stock shadow-[0_1px_0_rgb(31_45_39/0.25)] hover:border-press-deep hover:bg-press-deep",
        outline:
          "border-ink-label bg-transparent text-ink hover:bg-card-stock aria-expanded:bg-card-stock",
        secondary:
          "border-transparent bg-card-stock text-ink shadow-[var(--shadow-card)] hover:bg-paper",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-ink/6 aria-expanded:bg-ink/6",
        destructive:
          "border-brick bg-transparent text-brick hover:bg-brick/8",
        link: "h-auto border-transparent px-0 text-press underline decoration-1 underline-offset-4 hover:text-press-deep hover:decoration-2",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
