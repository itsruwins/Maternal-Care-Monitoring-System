import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils/cn"

// Pill buttons, Flo-style. 44px tall by default (mothers on phones);
// a small squeeze on press.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold whitespace-nowrap select-none outline-none transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-expo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-leaf text-white shadow-[0_1px_2px_rgb(31_45_39/0.12),0_8px_18px_-8px_rgb(62_90_77/0.55)] hover:bg-leaf-deep",
        secondary: "bg-white text-leaf shadow-[var(--shadow-soft)] hover:bg-cream",
        soft: "bg-mint text-leaf hover:bg-[#d7e1d9]",
        outline: "border border-sage bg-transparent text-ink hover:border-field hover:bg-white aria-expanded:bg-white",
        ghost: "bg-transparent text-ink hover:bg-ink/5 aria-expanded:bg-ink/5",
        destructive: "bg-blush text-rose-deep hover:bg-[#f0d8d1]",
        link: "h-auto rounded-none px-0 text-leaf underline decoration-1 underline-offset-4 hover:text-leaf-deep hover:decoration-2",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm",
        lg: "h-13 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-14 [&_svg:not([class*='size-'])]:size-6",
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
