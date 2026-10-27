import type { Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatDate } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";
import type { PregnancySummary } from "../types";

const CHIP = "inline-flex h-7 items-center rounded-full px-2.5 text-caption font-semibold whitespace-nowrap";

// Where a mother is now: "Week 24" + trimester while pregnant, her last
// outcome and its date otherwise.
export function PregnancyChip({ t, locale, pregnancy }: { t: Dictionary; locale: Locale; pregnancy: PregnancySummary }) {
  const m = t.mothers;
  if (pregnancy.kind === "active") {
    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={cn(CHIP, "bg-blush text-rose-deep")}>
          {pregnancy.weeks !== null ? format(m.week, { weeks: pregnancy.weeks }) : m.search.pregnant}
        </span>
        {pregnancy.trimester && <span className="text-sm text-ink-soft">{m.trimesters[pregnancy.trimester - 1]}</span>}
      </span>
    );
  }
  if (pregnancy.kind === "closed") {
    const outcome = pregnancy.outcome ? m.outcomes[pregnancy.outcome] : m.outcomes.OTHER;
    return (
      <span className={cn(CHIP, "bg-cream text-ink-soft")}>
        {pregnancy.outcomeDate ? format(m.outcomeOn, { outcome, date: formatDate(pregnancy.outcomeDate, locale, "short") }) : outcome}
      </span>
    );
  }
  return <span className="text-sm text-ink-soft">{m.noPregnancy}</span>;
}
