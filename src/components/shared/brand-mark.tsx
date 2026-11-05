import Image from "next/image"
import Link from "next/link"
import { SITE } from "@/config/site"
import { cn } from "@/lib/utils/cn"

// The barangay seal, small on a white disc, beside the text wordmark.
// `compact` is for crowded top bars: a smaller wordmark at phone width and
// the location line only from 640px. `wrap` lets the name sit on two lines
// from 360px to 419px instead of being cut off (the landing header).
// `sealOnlyNarrow` shows only the seal below 390px (the name stays for screen
// readers), for a top bar whose actions leave no room for it.
export function BrandMark({
  className,
  href = "/",
  compact = false,
  wrap = false,
  sealOnlyNarrow = false,
}: {
  className?: string
  href?: string
  compact?: boolean
  wrap?: boolean
  sealOnlyNarrow?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 rounded-full text-ink no-underline", wrap && "max-[399px]:gap-2", className)}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-[var(--shadow-soft)]">
        <Image src="/brand/seal-96.png" alt="" width={32} height={32} className="size-8 rounded-full" loading="eager" />
      </span>
      <span className={cn("flex min-w-0 flex-col leading-none", sealOnlyNarrow && "max-[389px]:sr-only")}>
        <span
          className={cn(
            "truncate font-bold tracking-[-0.015em]",
            compact ? "text-[0.95rem] sm:text-[1.0625rem]" : "text-[1.0625rem]",
            wrap && "min-[360px]:max-[419px]:leading-[1.1] min-[360px]:max-[419px]:whitespace-normal"
          )}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            "mt-1 hidden text-caption text-ink-soft",
            compact ? "sm:block" : "min-[420px]:block"
          )}
        >
          {SITE.location}
        </span>
      </span>
    </Link>
  )
}
