import { cn } from "@/lib/utils/cn";

/** Chart green stays inside charts (DESIGN.md). */
const GREEN = "#16805F";

export type Figure = {
  label: string;
  value: number;
  /** Part of the row above: indented, in ink-soft. */
  sub?: boolean;
  /** Rose-deep above zero (a count that needs someone). */
  alert?: boolean;
  /** The card's total, which the row is a share of: draws its bar (none when left out). */
  of?: number;
};

// Label, share bar and number rows with hairlines between. Each bar is the
// row's share of its card's total, on a mint
// track, so the biggest part shows at a glance; a count that needs someone
// fills rose-deep. The number always says the figure (the bar is decoration).
// On paper, just the label and number. On a full-width card the rows run in
// two columns from 1280px.
export function FigureList({ figures, columns = false, className }: { figures: Figure[]; columns?: boolean; className?: string }) {
  return (
    <dl
      className={cn(
        // Two columns (a full-width card): a line under every row, so both columns read the same.
        columns ? "xl:columns-2 xl:gap-x-12 xl:[&>div]:border-b xl:[&>div]:border-line max-xl:divide-y max-xl:divide-line" : "divide-y divide-line",
        className,
      )}
    >
      {figures.map((figure) => {
        const alert = figure.alert && figure.value > 0;
        const share = figure.of ? Math.min(figure.value / figure.of, 1) : null;
        return (
          <div
            key={figure.label}
            className="grid min-h-11 break-inside-avoid grid-cols-[minmax(0,1fr)_5rem_2.75rem] items-center gap-x-3 py-2 text-[0.95rem] sm:grid-cols-[minmax(0,1fr)_8rem_3rem] print:grid-cols-[minmax(0,1fr)_auto]"
          >
            <dt className={cn("min-w-0 break-words", figure.sub ? "pl-4 text-ink-soft" : "font-medium text-ink")}>{figure.label}</dt>
            <span aria-hidden className={cn("block h-2 overflow-hidden rounded-full print:hidden", share !== null && (alert ? "bg-blush" : "bg-mint"))}>
              {share !== null && share > 0 && (
                <span
                  className="block h-full origin-left rounded-full motion-safe:animate-grow-x"
                  style={{ width: `${Math.max(share * 100, 4)}%`, background: alert ? "var(--color-rose-deep)" : GREEN }}
                />
              )}
            </span>
            <dd className={cn("tnum text-right font-bold", alert ? "text-rose-deep" : "text-ink")}>{figure.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
