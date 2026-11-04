import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRightIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { cn } from "@/lib/utils/cn";

// One Summary section: a mint icon and its heading (with an optional short
// note on what's counted), its total large on the right, its rows, then a
// link to the list behind it.
export function ReportCard({
  id,
  icon,
  title,
  note,
  total,
  more,
  className,
  children,
}: {
  id: string;
  icon: Icon;
  title: string;
  note?: string;
  total: { value: number; label: string };
  /** The detail tab with these records. */
  more: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)] print:rounded-none print:border print:border-line",
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6 print:p-4">
        {/* On paper a long card may break across pages, but its heading always
            travels with its first rows (see [data-print-head] in globals.css). */}
        <div data-print-head className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <IconCircle icon={icon} tone="mint" size="sm" />
            <div className="min-w-0 pt-1">
              <h3 id={id} className="text-lg leading-snug font-bold">
                {title}
              </h3>
              {note && <p className="mt-1 text-sm text-ink-soft">{note}</p>}
            </div>
          </div>
          <p className="flex shrink-0 flex-col items-end text-right">
            <span className="tnum text-[1.75rem] leading-none font-extrabold tracking-[-0.02em] text-ink">{total.value}</span>
            <span className="mt-1 max-w-32 text-caption font-medium text-ink-soft">{total.label}</span>
          </p>
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <Link
        href={more.href}
        className="group flex min-h-12 items-center gap-1 border-t border-line bg-milk px-5 text-sm font-semibold text-leaf no-underline transition-colors hover:bg-cream/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid sm:px-6 print:hidden"
      >
        {more.label}
        <CaretRightIcon
          weight="bold"
          aria-hidden
          className="size-3.5 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
        />
      </Link>
    </section>
  );
}
