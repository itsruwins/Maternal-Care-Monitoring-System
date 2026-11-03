import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils/cn";

// Previous / "Page 2 of 5" / Next under a list. Hidden when there is one page.
// Below 360px the buttons show only their arrows (the words stay for screen readers).
export function Pager({
  page,
  pages,
  hrefFor,
  labels,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
  labels: { prev: string; next: string; page: string };
}) {
  if (pages <= 1) return null;
  const pageText = format(labels.page, { page, pages });
  // "1 ng 3" stays together, so a narrow phone breaks "Pahina / 1 ng 3", never before the last number;
  // tabular figures only on the numbers.
  const shown = pageText.replace(/ (\S+) (\S+)$/, "\u00a0$1\u00a0$2").split(/(\d+)/);
  return (
    <nav aria-label={pageText} className="flex items-center justify-between gap-3">
      <Button asChild variant="secondary" size="sm" className={cn("max-[359px]:px-3", page <= 1 && "pointer-events-none opacity-40")}>
        <Link href={hrefFor(page - 1)} aria-disabled={page <= 1}>
          <CaretLeftIcon weight="bold" aria-hidden />
          <span className="max-[359px]:sr-only">{labels.prev}</span>
        </Link>
      </Button>
      <span className="text-center text-sm text-ink-soft">
        {shown.map((part, i) => (i % 2 ? <span key={i} className="tnum">{part}</span> : part))}
      </span>
      <Button asChild variant="secondary" size="sm" className={cn("max-[359px]:px-3", page >= pages && "pointer-events-none opacity-40")}>
        <Link href={hrefFor(page + 1)} aria-disabled={page >= pages}>
          <span className="max-[359px]:sr-only">{labels.next}</span>
          <CaretRightIcon weight="bold" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
