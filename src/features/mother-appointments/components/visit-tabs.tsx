"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Upcoming / Past: a two-part switch that shows one list at a time. Both lists
 * are rendered on the server; this only chooses which one shows. Arrow keys
 * move between the two tabs.
 */
export function VisitTabs({ tabs }: { tabs: [{ label: string; panel: ReactNode }, { label: string; panel: ReactNode }] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = active === 0 ? 1 : 0;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={onKeyDown}
            className={cn(
              "tnum h-11 rounded-full px-4 text-[0.95rem] font-semibold transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out-expo)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf focus-visible:outline-solid",
              active === index ? "bg-white text-ink shadow-[var(--shadow-soft)]" : "text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div key={tab.label} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={active !== index}>
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
