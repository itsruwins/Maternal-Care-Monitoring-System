import { CheckupIcon, EducationIcon, LabTestIcon, SupplementIcon, VaccineIcon, type Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";

// The five activity types, in the order of the dictionary list.
const SERVICES: { icon: Icon; tile: string; circle: "fern" | "white" | "leaf" | "rose" }[] = [
  { icon: CheckupIcon, tile: "bg-mint", circle: "leaf" },
  { icon: VaccineIcon, tile: "bg-blush", circle: "white" },
  { icon: SupplementIcon, tile: "bg-beige", circle: "white" },
  { icon: LabTestIcon, tile: "bg-white", circle: "fern" },
  { icon: EducationIcon, tile: "bg-white", circle: "rose" },
];

// What the health center reminds her about. Phones: a list; desktop: five soft
// tiles with icon, title and text top-aligned.
export function Services({ t }: { t: Dictionary }) {
  const s = t.landing.services;

  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-6 bg-cream px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 id="services-title" className="text-title max-w-[22ch] font-extrabold">
          {s.title}
        </h2>
        <p className="mt-3 max-w-[52ch] text-lg leading-7 text-ink-soft">{s.intro}</p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {s.items.map((item, i) => {
            const style = SERVICES[i];
            return (
              <li
                key={item.name}
                className={cn(
                  "flex items-start gap-4 rounded-2xl p-5 lg:flex-col lg:gap-6 lg:p-6",
                  style.tile,
                  style.tile === "bg-white" && "shadow-[var(--shadow-soft)]"
                )}
              >
                <IconCircle
                  icon={style.icon}
                  tone={style.circle}
                  size="md"
                  className={cn("lg:size-14 lg:[&_svg]:size-7", style.circle === "white" && "text-rose-deep")}
                />
                {/* Top-aligned: titles start on the same line in every tile, and
                    each description follows its own title directly (no gaps). */}
                <div>
                  <h3 className="text-[1.0625rem] leading-6 font-semibold">{item.name}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-6 text-ink-soft">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
