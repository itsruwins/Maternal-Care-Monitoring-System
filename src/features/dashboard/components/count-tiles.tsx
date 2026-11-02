import Link from "next/link";
import { CaretRightIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_LINKS } from "../paths";
import type { DashboardCounts } from "../types";

const TILES = ["today", "requests", "followUps", "pregnant", "dueSoon"] as const;
// Counts that need someone: rose-deep above zero (The Rose Is an Accent Rule).
const ALERTS: ReadonlySet<(typeof TILES)[number]> = new Set(["requests", "followUps"]);

/** "Today's appointments" → "Today's " and "appointments". */
const leadingWords = (label: string) => label.slice(0, label.lastIndexOf(" ") + 1);
const lastWord = (label: string) => label.slice(label.lastIndexOf(" ") + 1);

// Five count tiles in the SMS log's tile style, each opening its page. Five
// across from 1280px (beside the sidebar there's no room at 1024px), three
// then two from 768px, two per row on phones (the fifth takes the full row).
export function CountTiles({ t, counts }: { t: Dictionary; counts: DashboardCounts }) {
  const c = t.dashboard.counts;
  return (
    <nav aria-label={t.dashboard.countsLabel}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {TILES.map((key) => {
          const alert = ALERTS.has(key) && counts[key] > 0;
          return (
            <li key={key} className="max-md:last:col-span-2">
              <Link
                href={DASHBOARD_LINKS[key]}
                className="flex h-full flex-col gap-0.5 rounded-2xl border-2 border-transparent bg-white px-4 py-3.5 no-underline shadow-[var(--shadow-soft)] transition-colors hover:border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid sm:px-5"
              >
                <span className={cn("tnum text-2xl font-extrabold", alert ? "text-rose-deep" : "text-ink")}>{counts[key]}</span>
                {/* The caret stays glued to the last word, even when the label wraps. */}
                <span className="text-sm font-medium text-ink-soft">
                  {leadingWords(c[key])}
                  <span className="whitespace-nowrap">
                    {lastWord(c[key])}
                    <CaretRightIcon weight="bold" aria-hidden className="ml-1 inline size-3.5 align-[-0.125em] text-leaf" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
