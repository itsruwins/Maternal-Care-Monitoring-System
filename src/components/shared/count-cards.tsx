import Link from "next/link";
import { CaretRightIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { cn } from "@/lib/utils/cn";

export type CountCard = { key: string; label: string; count: number; href: string; icon: Icon; alert?: boolean };

// A strip of four counts above a page's lists, each opening the list behind
// it (or the section below that shows it): the count in large tabular numerals over its label with a caret, a
// small icon circle on the right. A count that needs someone (alert) turns
// rose-deep with a blush circle. Two per row on phones, four from 1024px.
export function CountCards({ label, cards }: { label: string; cards: CountCard[] }) {
  return (
    <nav aria-label={label}>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ key, label: name, count, href, icon, alert = false }) => (
          <li key={key} className="min-w-0">
            <Link
              href={href}
              // A link to a section further down (#today) scrolls to it; a filter stays put.
              scroll={href.includes("#") ? undefined : false}
              className="group flex h-full items-start justify-between gap-3 rounded-2xl border-2 border-transparent bg-white p-4 no-underline shadow-[var(--shadow-soft)] transition-[border-color,transform] duration-200 ease-[var(--ease-out-expo)] hover:border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid active:scale-[0.98] sm:p-5"
            >
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className={cn("tnum text-[1.75rem] leading-none font-extrabold tracking-[-0.02em]", alert ? "text-rose-deep" : "text-ink")}>{count}</span>
                <span className="text-sm font-medium text-ink-soft">
                  {head(name)}
                  {/* The caret stays with the label's last word. */}
                  <span className="whitespace-nowrap">
                    {tail(name)}
                    <CaretRightIcon
                      weight="bold"
                      aria-hidden
                      className="ml-1 inline size-3.5 align-[-0.125em] text-leaf transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </span>
              <IconCircle icon={icon} tone={alert ? "blush" : "mint"} size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A label up to (and with) its last space, and its last word. */
const head = (label: string) => label.slice(0, label.lastIndexOf(" ") + 1);
const tail = (label: string) => label.slice(label.lastIndexOf(" ") + 1);
