import { FolderCard } from "@/components/ui/folder-card";
import type { Dictionary } from "@/i18n/get-dictionary";

// The card's printed schedule grid: one ruled row per maternal-care activity.
export function ServicesSchedule({ t }: { t: Dictionary }) {
  const s = t.landing.services;

  return (
    <FolderCard tab={t.landing.tabs.services} labelledBy="services-title" stacked>
      <div className="grid gap-8 px-6 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <h2 id="services-title" className="display-print text-[clamp(2rem,4.4vw,3rem)] leading-[1]">
            {s.title}
          </h2>
          <p className="mt-4 max-w-[40ch] text-[1.05rem] leading-relaxed text-ink/80">{s.intro}</p>
        </div>
        <ul className="border-t border-rule">
          {s.items.map((item) => (
            <li key={item.name} className="border-b border-rule py-4">
              <h3 className="text-[1.08rem] font-bold">{item.name}</h3>
              <p className="mt-1 text-[0.95rem] text-ink/75">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </FolderCard>
  );
}
