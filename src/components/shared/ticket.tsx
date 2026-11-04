import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type TicketTone = "mint" | "blush" | "leaf" | "rose";

const STUB: Record<TicketTone, string> = {
  mint: "bg-mint text-leaf",
  blush: "bg-blush text-rose-deep",
  leaf: "bg-leaf text-white",
  /** The exception only (e.g. a follow-up waiting over a week). */
  rose: "bg-rose-deep text-white",
};

// A booking ticket: a tinted stub down the left (when), a dashed tear line
// with a notch cut into the top and bottom, the body, and a milk band for the
// actions. One padding rhythm: 24px around the body and the band from 640px
// (20px on phones), 16px between the body's groups.
export function Ticket({ tone, stub, children, footer }: { tone: TicketTone; stub: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-1">
        <div className={cn("flex w-24 shrink-0 flex-col items-center justify-center px-2 py-5 text-center sm:w-32 sm:py-6", STUB[tone])}>{stub}</div>
        {/* The tear line, with a notch cut into the top and the bottom. */}
        <div aria-hidden className="relative w-0 shrink-0 border-l-2 border-dashed border-sage/80">
          <span className="absolute -top-2.5 left-1/2 size-5 -translate-x-1/2 rounded-full bg-milk" />
          <span className="absolute -bottom-2.5 left-1/2 z-10 size-5 -translate-x-1/2 rounded-full bg-milk" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6">{children}</div>
      </div>
      {footer && <div className="border-t border-line bg-milk px-5 py-4 sm:px-6">{footer}</div>}
    </article>
  );
}

/** The time on the stub's white pill. */
export function TicketPill({ children }: { children: ReactNode }) {
  return (
    <span className="tnum mt-4 rounded-full bg-white px-2.5 py-1 text-sm font-bold whitespace-nowrap text-ink shadow-[var(--shadow-soft)]">{children}</span>
  );
}
