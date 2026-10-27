import { FetusIcon } from "@/components/icons/fetus-icon";
import type { Trimester } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";

const GLYPH: Record<Trimester, string> = { 1: "size-[52%]", 2: "size-[64%]", 3: "size-[76%]" };

// The baby for the current trimester, on a soft blush circle. For now the
// fetus glyph grows with the trimester; the approved pictures replace it (Phase 3, step 5).
export function TrimesterPicture({ trimester, className }: { trimester: Trimester; className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-24 shrink-0 place-items-center rounded-full bg-blush text-rose-deep", className)}>
      <FetusIcon className={GLYPH[trimester]} />
    </span>
  );
}
