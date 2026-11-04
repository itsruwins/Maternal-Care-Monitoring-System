"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { CaretDownIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

// Her "what to bring" tick lives only in this browser, one key per visit, so it
// starts fresh for her next visit. Nothing reaches the database.
const PREFIX = "taysan:bring:";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readTick(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeTick(key: string, ticked: boolean) {
  try {
    // Ticks for earlier visits are no longer needed.
    for (const stored of Object.keys(window.localStorage)) {
      if (stored.startsWith(PREFIX) && stored !== key) window.localStorage.removeItem(stored);
    }
    if (ticked) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {
    // Storage blocked (private mode): the tick just isn't remembered.
  }
  listeners.forEach((listener) => listener());
}

/**
 * The health center's details and what to bring. Phones can fold it away;
 * laptops always show it.
 */
export function ClinicInfo({
  title,
  rows,
  bringTitle,
  items,
  visitKey,
  className,
}: {
  title: string;
  rows: { label: string; value: string }[];
  bringTitle: string;
  items: string[];
  /** The next visit's id (the ticks reset when it changes). */
  visitKey: string;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <section aria-labelledby={`${id}-title`} className={cn("rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)]", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="text-lg leading-7 font-bold">
          {title}
        </h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          aria-label={title}
          onClick={() => setOpen((value) => !value)}
          className="-mr-2 grid size-11 place-items-center rounded-full text-ink-soft outline-none hover:bg-cream focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-solid lg:hidden"
        >
          <CaretDownIcon weight="bold" aria-hidden className={cn("size-5 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>
      <div id={`${id}-body`} className={cn("mt-4", !open && "hidden lg:block")}>
        <dl className="flex flex-col gap-3 text-[0.95rem]">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-sm text-ink-soft">{row.label}</dt>
              <dd className="mt-0.5 min-w-0 font-medium break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-xs font-bold tracking-[0.08em] text-ink-soft uppercase">{bringTitle}</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <li key={item}>
                <BringItem storageKey={`${PREFIX}${visitKey}:${item}`} label={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// 12px corners inside the 36px card's 24px padding (corners that share a
// center); 16px all round the 24px checkbox, so the row is 56px tall.
function BringItem({ storageKey, label }: { storageKey: string; label: string }) {
  const ticked = useSyncExternalStore(
    subscribe,
    () => readTick(storageKey),
    () => false,
  );
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md bg-mint/60 p-4 has-focus-visible:outline-2 has-focus-visible:outline-leaf has-focus-visible:outline-solid">
      <span className="relative grid size-6 shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={ticked}
          onChange={(event) => writeTick(storageKey, event.target.checked)}
          className="peer size-6 cursor-pointer appearance-none rounded-[6px] border-2 border-field bg-white outline-none checked:border-leaf checked:bg-leaf"
        />
        <CheckIcon weight="bold" aria-hidden className="pointer-events-none absolute size-4 text-white opacity-0 peer-checked:opacity-100" />
      </span>
      <span className={cn("font-medium", ticked && "text-ink-soft")}>{label}</span>
    </label>
  );
}
