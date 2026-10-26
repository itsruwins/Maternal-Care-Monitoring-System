import Image from "next/image"
import Link from "next/link"
import { SITE } from "@/config/site"
import { cn } from "@/lib/utils/cn"

// The barangay seal, small on a white disc, beside the text wordmark.
export function BrandMark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 rounded-full text-ink no-underline", className)}
    >
      <span className="grid size-10 place-items-center rounded-full bg-white shadow-[var(--shadow-soft)]">
        <Image src="/brand/seal-96.png" alt="" width={32} height={32} className="size-8 rounded-full" priority />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[1.0625rem] font-bold tracking-[-0.015em]">{SITE.name}</span>
        <span className="mt-1 hidden text-caption text-ink-soft min-[420px]:block">{SITE.location}</span>
      </span>
    </Link>
  )
}
