import type { ReactNode } from "react";
import type { Icon } from "@/components/icons";
import { IconCircle } from "@/components/ui/icon-circle";
import { cn } from "@/lib/utils/cn";

// One Summary section: a mint icon, its heading, an optional short note on
// what's counted, then its figures.
export function ReportCard({
  id,
  icon,
  title,
  note,
  className,
  children,
}: {
  id: string;
  icon: Icon;
  title: string;
  note?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("min-w-0 rounded-3xl bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7 print:rounded-none print:border print:border-line print:p-4", className)}
    >
      {/* On paper a long card may break across pages, but its heading always
          travels with its first rows (see [data-print-head] in globals.css). */}
      <div data-print-head>
        <div className="flex items-center gap-3">
          <IconCircle icon={icon} tone="mint" size="sm" />
          <h3 id={id} className="text-lg font-bold">
            {title}
          </h3>
        </div>
        {note && <p className="mt-2 text-sm text-ink-soft">{note}</p>}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
