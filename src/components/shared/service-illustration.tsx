import Image from "next/image";
import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import { cn } from "@/lib/utils/cn";

// A service's people illustration (client-generated, public/services/*.webp),
// for the big service tiles. Decorative: the name is always written under it.
// Small places use <ServiceArt> instead.
// `eager`: the tiles at the top of a form load at once instead of waiting until scrolled to.
export function ServiceIllustration({ icon, className, eager }: { icon: ServiceIconKey; className?: string; eager?: boolean }) {
  return (
    <span aria-hidden className={cn("relative block aspect-square w-full", className)}>
      <Image src={`/services/${icon}.webp`} alt="" fill sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw" loading={eager ? "eager" : undefined} className="object-contain" />
    </span>
  );
}
