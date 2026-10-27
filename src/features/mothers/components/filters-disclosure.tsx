"use client";

import { useState, type ReactNode } from "react";
import { CaretDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Phones: the extra filters fold behind a "Filters" button so the first
// mothers show without scrolling (open when a filter is already in use).
// From 640px they are always shown, as cells of the filter grid.
export function FiltersDisclosure({ label, active, children }: { label: string; active: number; children: ReactNode }) {
  const [open, setOpen] = useState(active > 0);
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        aria-expanded={open}
        aria-controls="mother-extra-filters"
        onClick={() => setOpen((value) => !value)}
        className="h-12 justify-between sm:hidden"
      >
        {active > 0 ? `${label} (${active})` : label}
        <CaretDownIcon weight="bold" aria-hidden className={cn("transition-transform", open && "rotate-180")} />
      </Button>
      {/* Folded selects are only hidden, so their values still go with the search. */}
      <div id="mother-extra-filters" className={cn(open ? "grid gap-3" : "hidden", "sm:contents")}>
        {children}
      </div>
    </>
  );
}
