import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

// One dashboard panel: a 28px white card whose header holds the 18px bold
// title (with an optional badge beside it) and, on the right, the link to the
// page behind it. The body sits on the same 20 / 24px side padding.
export function DashCard({
  id,
  title,
  badge,
  link,
  children,
  className,
}: {
  /** Used for the heading id (aria-labelledby). */
  id: string;
  title: string;
  badge?: ReactNode;
  link?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("min-w-0 rounded-2xl bg-white shadow-[var(--shadow-soft)]", className)}>
      <header className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pt-4 sm:px-6 sm:pt-5">
        <h2 id={id} className="flex min-w-0 items-center gap-2 text-lg font-bold text-balance">
          {title}
          {badge}
        </h2>
        {link && <CardLink href={link.href}>{link.label}</CardLink>}
      </header>
      {children}
    </section>
  );
}

/** The leaf "See all ›" style link used in card headers and group headers. */
export function CardLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-sm text-sm font-semibold text-leaf underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
        className,
      )}
    >
      {children}
      <CaretRightIcon weight="bold" aria-hidden className="size-3.5" />
    </Link>
  );
}
