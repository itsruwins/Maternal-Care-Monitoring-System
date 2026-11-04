import Link from "next/link";
import { ScrollActiveIntoView } from "@/components/shared/scroll-active-into-view";
import { cn } from "@/lib/utils/cn";

export type PillTab = { key: string; label: string; count?: number; href: string; active: boolean };

// A row of outlined pills above a list card, each with its count (when given); the
// current one is solid leaf. On phones the row scrolls sideways and keeps the
// current tab in view.
export function PillTabs({ label, tabs }: { label: string; tabs: PillTab[] }) {
  return (
    <nav aria-label={label}>
      <ScrollActiveIntoView className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-24px),transparent)]">
        <ul className="flex w-max gap-1.5">
          {tabs.map((tab) => (
            <li key={tab.key}>
              <Link
                href={tab.href}
                scroll={false}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm whitespace-nowrap no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
                  tab.active ? "border-leaf bg-leaf font-semibold text-white" : "border-line bg-white font-medium text-ink-soft hover:border-sage hover:text-ink",
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn("tnum text-caption font-bold", tab.active ? "text-white/85" : "text-ink-soft")}>{tab.count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollActiveIntoView>
    </nav>
  );
}
