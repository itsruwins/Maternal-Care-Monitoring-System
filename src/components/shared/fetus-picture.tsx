import { FetusIcon } from "@/components/icons/fetus-icon";
import type { Trimester } from "@/lib/utils/pregnancy";
import { cn } from "@/lib/utils/cn";

// The baby picture shown beside "weeks pregnant" (mother's Today screen, landing
// hero, staff pregnancy tab), in Flo's style: a soft baby-in-womb glyph inside a
// rose circle. The glyph grows a little each trimester. Decorative: text nearby
// always gives the weeks.
const GLYPH: Record<Trimester, string> = {
  1: "w-[50%]",
  2: "w-[60%]",
  3: "w-[70%]",
};

export function FetusPicture({ trimester, className }: { trimester: Trimester; className?: string }) {
  return (
    <span
      aria-hidden
      data-trimester={trimester}
      className={cn("grid aspect-square place-items-center rounded-full bg-rose text-white", className)}
    >
      <FetusIcon className={cn("h-auto transition-[width] duration-500 ease-[var(--ease-out-expo)]", GLYPH[trimester])} />
    </span>
  );
}
