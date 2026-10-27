import {
  CarrotIcon,
  ChatsCircleIcon,
  CheckupIcon,
  DropIcon,
  EducationIcon,
  HeartbeatIcon,
  HeartIcon,
  LabTestIcon,
  LeafIcon,
  PlusIcon,
  PregnancyIcon,
  SparkleIcon,
  SupplementIcon,
  ToothIcon,
  VaccineIcon,
  type Icon,
} from "@/components/icons";
import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import { cn } from "@/lib/utils/cn";

type Tone = "mint" | "blush" | "beige";

const ART: Record<ServiceIconKey, { icon: Icon; tone: Tone }> = {
  checkup: { icon: CheckupIcon, tone: "mint" },
  vaccine: { icon: VaccineIcon, tone: "blush" },
  supplement: { icon: SupplementIcon, tone: "beige" },
  lab: { icon: LabTestIcon, tone: "blush" },
  education: { icon: EducationIcon, tone: "beige" },
  heartbeat: { icon: HeartbeatIcon, tone: "mint" },
  baby: { icon: PregnancyIcon, tone: "blush" },
  heart: { icon: HeartIcon, tone: "blush" },
  nutrition: { icon: CarrotIcon, tone: "mint" },
  dental: { icon: ToothIcon, tone: "mint" },
  blood: { icon: DropIcon, tone: "blush" },
  counseling: { icon: ChatsCircleIcon, tone: "beige" },
};

const BLOB: Record<Tone, string> = { mint: "fill-mint", blush: "fill-blush", beige: "fill-cream" };
const INK: Record<Tone, string> = { mint: "text-leaf", blush: "text-rose-deep", beige: "text-leaf" };

// A service's picture, Flo style: a big soft icon on a pastel blob, with a
// leaf, a plus and a sparkle around it. Decorative (the service name is
// always written next to it).
export function ServiceArt({ icon, size = "lg", className }: { icon: ServiceIconKey; size?: "sm" | "md" | "lg"; className?: string }) {
  const { icon: Glyph, tone } = ART[icon];
  const accents = size !== "sm";
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center",
        size === "lg" && "aspect-[5/4] w-full max-w-44",
        size === "md" && "aspect-[5/4] w-28",
        size === "sm" && "size-14",
        className,
      )}
    >
      <svg viewBox="0 0 200 160" className={cn("absolute inset-0 size-full", BLOB[tone])} preserveAspectRatio="none">
        <path d="M104 10c40-2 80 16 88 50s-10 70-46 84-92 12-116-14S6 70 30 42 64 12 104 10z" />
      </svg>
      <Glyph weight={size === "sm" ? "duotone" : "fill"} className={cn("relative", INK[tone], size === "lg" ? "size-[46%]" : size === "md" ? "size-[44%]" : "size-7")} />
      {accents && (
        <>
          <LeafIcon weight="fill" className="absolute bottom-[8%] left-[6%] size-[16%] -rotate-45 text-fern/80" />
          <PlusIcon weight="bold" className="absolute top-[10%] right-[10%] size-[11%] text-rose" />
          <SparkleIcon weight="fill" className="absolute top-[16%] left-[14%] size-[9%] text-rose/70" />
        </>
      )}
    </span>
  );
}
