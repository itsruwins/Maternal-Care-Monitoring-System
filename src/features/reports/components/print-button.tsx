"use client";

import { PrinterIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

// Opens the browser's print dialog for the page (the print styles keep only the report).
export function PrintButton({ label }: { label: string }) {
  return (
    <Button type="button" variant="secondary" className="h-11" onClick={() => window.print()}>
      <PrinterIcon weight="bold" aria-hidden />
      {label}
    </Button>
  );
}
