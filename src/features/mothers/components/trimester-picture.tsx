import Image from "next/image";
import type { Trimester } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";

// The baby for the current trimester, a soft 3D picture in a circle (same
// framing for all three, so the baby visibly grows). Decorative: the week and
// trimester are always written next to it.
export function TrimesterPicture({ trimester, className, priority }: { trimester: Trimester; className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative block size-24 shrink-0 overflow-hidden rounded-full bg-blush", className)}>
      <Image
        src={`/fetus/trimester-${trimester}.webp`}
        alt=""
        fill
        sizes="(min-width: 640px) 224px, 160px"
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
