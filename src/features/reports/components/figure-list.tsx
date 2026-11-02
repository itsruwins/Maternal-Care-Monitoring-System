import { cn } from "@/lib/utils/cn";

export type Figure = {
  label: string;
  value: number;
  /** Part of the row above: indented, in ink-soft. */
  sub?: boolean;
  /** Rose-deep above zero (a count that needs someone). */
  alert?: boolean;
};

// Label and number rows with hairlines between, like the dashboard's admin
// cards but without links.
export function FigureList({ figures, className }: { figures: Figure[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {figures.map((figure) => (
        <div key={figure.label} className="flex min-h-11 items-center justify-between gap-4 py-2 text-[0.95rem]">
          <dt className={cn("min-w-0 break-words", figure.sub ? "pl-4 text-ink-soft" : "font-medium text-ink")}>{figure.label}</dt>
          <dd className={cn("tnum shrink-0 font-bold", figure.alert && figure.value > 0 ? "text-rose-deep" : "text-ink")}>{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}
