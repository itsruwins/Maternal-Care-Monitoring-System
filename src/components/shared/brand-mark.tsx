import Image from "next/image"
import Link from "next/link"
import { SITE } from "@/config/site"
import { cn } from "@/lib/utils/cn"

// The barangay seal, small on a cream disc, beside the text wordmark.
export function BrandMark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 rounded-md text-ink no-underline", className)}
    >
      <span className="grid size-10 place-items-center rounded-full bg-card-stock shadow-[var(--shadow-card)] ring-1 ring-rule">
        <Image src="/brand/seal-96.png" alt="" width={32} height={32} className="size-8 rounded-full" priority />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-bold tracking-[-0.01em]">{SITE.name}</span>
        <span className="label-print mt-1 hidden text-[0.68rem] min-[420px]:block">{SITE.location}</span>
      </span>
    </Link>
  )
}
