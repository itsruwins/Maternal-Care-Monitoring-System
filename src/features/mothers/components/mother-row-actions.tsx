"use client";

import Link from "next/link";
import { CalendarPlusIcon, CheckupIcon, MoreIcon, RecordsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { bookForMotherHref, motherRecordHref, recordVisitForMotherHref } from "../paths";

// The ⋯ menu at the end of a mother's row: open her record and, while she is
// pregnant, book an appointment or record a visit for her (the pages already
// take ?mother=). The menu opens from its button, aligned to its right edge.
export function MotherRowActions({
  motherId,
  pregnant,
  labels,
  className,
}: {
  motherId: number;
  pregnant: boolean;
  labels: { menu: string; open: string; book: string; visit: string };
  className?: string;
}) {
  const items = [
    { href: motherRecordHref(motherId), label: labels.open, icon: RecordsIcon },
    ...(pregnant
      ? [
          { href: bookForMotherHref(motherId), label: labels.book, icon: CalendarPlusIcon },
          { href: recordVisitForMotherHref(motherId), label: labels.visit, icon: CheckupIcon },
        ]
      : []),
  ];
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.menu} className={cn("text-ink-soft hover:text-ink", className)}>
          <MoreIcon weight="bold" aria-hidden className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="origin-(--radix-dropdown-menu-content-transform-origin)">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="no-underline">
              <item.icon weight="bold" aria-hidden />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
