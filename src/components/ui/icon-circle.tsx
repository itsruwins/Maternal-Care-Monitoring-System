import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { Icon, IconWeight } from "@/components/icons"
import { cn } from "@/lib/utils/cn"

// A feature icon inside a soft colored circle (Flo-style).
// Every tone keeps the glyph at 3:1 or more against its circle.
const iconCircleVariants = cva("inline-grid shrink-0 place-items-center rounded-full", {
  variants: {
    tone: {
      fern: "bg-fern text-white",
      leaf: "bg-leaf text-white",
      mint: "bg-mint text-leaf",
      blush: "bg-blush text-rose-deep",
      rose: "bg-rose text-ink",
      beige: "bg-beige text-leaf",
      cream: "bg-cream text-leaf",
      white: "bg-white text-leaf shadow-[var(--shadow-soft)]",
    },
    size: {
      sm: "size-9 [&_svg]:size-[1.125rem]",
      md: "size-12 [&_svg]:size-6",
      lg: "size-16 [&_svg]:size-8",
      xl: "size-20 [&_svg]:size-10",
    },
  },
  defaultVariants: { tone: "mint", size: "md" },
})

function IconCircle({
  icon: Glyph,
  weight = "fill",
  tone,
  size,
  label,
  className,
}: VariantProps<typeof iconCircleVariants> & {
  icon: Icon
  weight?: IconWeight
  /** Accessible name. Leave out when the icon is decorative (text nearby says the same). */
  label?: string
  className?: string
}) {
  return (
    <span
      data-slot="icon-circle"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(iconCircleVariants({ tone, size }), className)}
    >
      <Glyph weight={weight} aria-hidden />
    </span>
  )
}

export { IconCircle, iconCircleVariants }
