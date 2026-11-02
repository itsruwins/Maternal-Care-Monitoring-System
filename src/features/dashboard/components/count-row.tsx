import Link from "next/link";
import { CaretRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

// One line in an admin card: a label and its count, opening its list when it
// has one (a leaf caret says so). Sub-rows are indented in ink-soft; an alert
// count turns rose-deep above zero.
export function CountRow({
  label,
  count,
  href,
  sub = false,
  alert = false,
}: {
  label: string;
  count: number;
  href?: string;
  sub?: boolean;
  alert?: boolean;
}) {
  const body = (
    <>
      <span className={cn("min-w-0 break-words", sub ? "pl-4 text-ink-soft" : "font-medium text-ink")}>{label}</span>
      <span className="flex shrink-0 items-center gap-1.5">
        <span className={cn("tnum font-bold", alert && count > 0 ? "text-rose-deep" : "text-ink")}>{count}</span>
        <CaretRightIcon weight="bold" aria-hidden className={cn("size-3.5 text-leaf", !href && "invisible")} />
      </span>
    </>
  );
  const row = "flex min-h-11 items-center justify-between gap-4 py-2 text-[0.95rem]";
  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={cn(
            row,
            "-mx-2 rounded-xl px-2 no-underline transition-colors hover:bg-milk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
          )}
        >
          {body}
        </Link>
      ) : (
        <div className={row}>{body}</div>
      )}
    </li>
  );
}
