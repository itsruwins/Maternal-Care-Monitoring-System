import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { format } from "@/i18n/format";

// Previous / "Page 2 of 5" / Next under a list. Hidden when there is one page.
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
  return (
    <nav aria-label={pageText} className="flex items-center justify-between gap-3">
      <Button asChild variant="secondary" size="sm" className={page <= 1 ? "pointer-events-none opacity-40" : ""}>
        <Link href={hrefFor(page - 1)} aria-disabled={page <= 1}>
          <CaretLeftIcon weight="bold" aria-hidden />
          {labels.prev}
        </Link>
      </Button>
      <span className="tnum text-sm text-ink-soft">{pageText}</span>
      <Button asChild variant="secondary" size="sm" className={page >= pages ? "pointer-events-none opacity-40" : ""}>
        <Link href={hrefFor(page + 1)} aria-disabled={page >= pages}>
          {labels.next}
          <CaretRightIcon weight="bold" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
