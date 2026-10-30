"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps a sideways-scrolling tab bar and scrolls the current tab
// ([aria-current="page"]) into view, so it's never hidden off-screen on phones.
export function ScrollActiveIntoView({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const active = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !active) return;
    box.scrollLeft = active.offsetLeft - (box.clientWidth - active.offsetWidth) / 2;
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
