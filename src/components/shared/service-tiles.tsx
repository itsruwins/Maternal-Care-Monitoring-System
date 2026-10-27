"use client";

import type { ServiceIconKey } from "@/lib/appointments/service-icons";
import { cn } from "@/lib/utils/cn";
import { ServiceIllustration } from "./service-illustration";

type TileService = { id: number; name: string; icon: ServiceIconKey };

// Big tappable service tiles (people illustration + name), the first step of
// requesting or booking a visit. "compact" for staff screens.
export function ServiceTiles({
  services,
  onPick,
  label,
  compact = false,
}: {
  services: TileService[];
  onPick: (id: number) => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <ul aria-label={label} className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4")}>
      {services.map((service) => (
        <li key={service.id}>
          <button
            type="button"
            onClick={() => onPick(service.id)}
            className={cn(
              "group flex size-full flex-col items-center justify-start rounded-3xl border border-line bg-white text-center transition-all hover:-translate-y-0.5 hover:border-leaf hover:shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf",
              compact ? "gap-1.5 px-3 pt-3 pb-3.5" : "gap-2 px-3 pt-4 pb-5 sm:px-4",
            )}
          >
            <ServiceIllustration icon={service.icon} priority={!compact} className={compact ? "max-w-32" : "max-w-52"} />
            <span className={cn("font-bold text-balance text-ink", compact ? "text-[0.95rem] leading-5" : "text-base leading-6 sm:text-lg")}>{service.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
