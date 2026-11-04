"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

// A small copy button beside her mobile number: the glyph turns into a leaf
// check for two seconds and a toast confirms it.
export function CopyNumberButton({
  number,
  labels,
}: {
  number: string;
  labels: { copy: string; copied: string; failed: string };
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      toast.success(labels.copied);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(labels.failed);
    }
  };

  const Glyph = copied ? CheckIcon : CopyIcon;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={labels.copy}
      title={labels.copy}
      className={cn(
        "relative -my-1 inline-grid size-8 shrink-0 place-items-center rounded-full text-ink-soft transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-expo)] hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-leaf focus-visible:outline-solid active:scale-[0.92]",
        // A 44px touch target around the 32px circle.
        "after:absolute after:-inset-1.5",
        copied && "text-leaf hover:text-leaf",
      )}
    >
      <Glyph key={copied ? "done" : "copy"} weight="bold" aria-hidden className="size-4 motion-safe:animate-pop" />
    </button>
  );
}
