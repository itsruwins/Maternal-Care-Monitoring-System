import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { reportCsvHref } from "../paths";
import type { ReportFilters } from "../types";
import { PrintButton } from "./print-button";

// Print the tab, or download it as a CSV (a plain link to the CSV route, which
// checks the role itself). Hidden on paper.
export function ReportActions({ t, locale, filters }: { t: Dictionary; locale: Locale; filters: ReportFilters }) {
  const p = t.reports.print;
  return (
    <div role="group" aria-label={t.reports.actionsLabel} className="flex flex-wrap gap-2 print:hidden">
      <PrintButton label={p.button} />
      <Button asChild variant="secondary" className="h-11">
        <a href={reportCsvHref(filters, locale)} download>
          <DownloadIcon weight="bold" aria-hidden />
          {p.csv}
        </a>
      </Button>
    </div>
  );
}
